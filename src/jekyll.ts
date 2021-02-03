// update github tree: http://www.levibotelho.com/development/commit-a-file-with-the-github-api/

import { Octokit } from "@octokit/rest";
import slugify from 'slugify'
import matter from 'gray-matter'
import urljoin from 'url-join'
import axios from 'axios'
import {validate} from 'jsonschema'

import {toTitleCase} from '@/utils'


import moment from 'moment'
var pathParse = require('path-parse');

/* utilities */
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1:number) {
            return String.fromCharCode(parseInt('0x' + p1, 16));
    }));
}

class JekyllError{
    name: string = "JekyllError";
    message: string;
    constructor(message){
        this.message = message;
    }
}

/* SCHEMAS */
const image_schema = {
    type: "object",
    properties: {
        title: {type: "string"},
        url: {type: "string", minLength: 1},
        alt: {type: "string"}
    },
    required: ["url"]
}

const figure_schema = {
    type: "object",
    properties:{
        image: image_schema,
        caption: {type: ["string", "null"]}
    },
    required: ["image"]
}

const project_schema = {
    type: "object",
    properties: {
        id: {type: 'string', minLength: 1},
        title: {type: "string", minLength: 1},
        content: {type: "string"},
        gallery: {
            type: "array",
            items: figure_schema
        }
    },
    required: ["title", "content", "gallery"],
    additionalProperties: false,
};

const post_schema = {
    type: "object",
    properties: {
        id: {type: "string", minLength: 1},
        title: {type: "string", minLength: 1},
        date: {type: 'string', length: 10},
        content: {type: 'string'},
        image: image_schema
    },
    required: ['title', 'date']
}

const page_schema = {
    type: "object",
    properties: {
        id: {type: "string", minLength: 1},
        title: {type: 'string', minLength: 1},
        content: {type: 'string'}
    },
    required: ['title']
}

/* INTERFACES */
interface IImage{
	title?: string;
	url: string;
	alt?: string;
}

interface IFigure{
	image: IImage;
	caption?: string
}

interface IProject{
    id?: string;
    title: string;
    content: string;
    gallery?: Array<IFigure>;
}

interface IPost{
    id?: string;
    title: string;
    date: string;
    content: string;
    image?: IImage;
}

interface IPage{
    id?: string;
    title: string;
    content: string;
    exclude: boolean;
}

/* JEKYLL */
class Jekyll{
    owner: string;
    repo: string;
    branch: string;
    token: string;
    octokit: any;
    stage: object = {};
    listeners: object = {};
    

    constructor({owner, repo, branch, token}: {owner: string, repo: string, branch: string, token: string}){
        this.owner = owner;
        this.repo = repo;
        this.branch = branch;
        this.token = token
        this.octokit = new Octokit({
            auth: token,
        });

        this.listeners['onlog'] = []
    }

    /* HELPERS */
    slugify(text: string): string{
        return slugify(text).toLowerCase()
    }

    log(msg:string){
        console.log(msg)
        for(let cb of this.listeners['onlog']){
            cb(msg);
        }
    }

    addEventListener(name:string, callback){
        if(!(name in this.listeners)){
            throw Error(name+"not an event name")
        }
        this.listeners[name].push(callback)
    }
    removeEventListener(name:string, callback){
        const idx = this.listeners[name].indexOf(callback)
        this.listeners[name].splice(idx, 1)
    }

    parseDataUrl(url:string): {mediatype: string, data: string}{
        // base64 encoded data doesn't contain commas    
        let base64ContentArray = url.split(",")     
           
        // base64 content cannot contain whitespaces but nevertheless skip if there are!
        let found = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)
        if(!found){
            throw "not data url"
        }
        let mediatype: string = found[0];

        // base64 encoded data - pure
        let data = base64ContentArray[1]

        return {mediatype, data}
    }

    /* GITHUB */
    getRawContentUrl(path: string): string{
        return urljoin(`https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/`, path);
    }

    async loadTree(){

    }

    async save(){
        const stage = {...this.stage};
        // UPDATE TREE
        // create git blobs
        this.log("saving...")
        const owner = this.owner;
        const repo = this.repo
        const branch = this.branch
        const octokit = this.octokit;

        const git_tree: Array<any> = []
        for(let path in stage){
            const file = stage[path]
            this.log("  - "+path)
            if(file.content){
                let {data: git_blob} = await this.octokit.git.createBlob({
                    owner,
                    repo,
                    content: file.content,
                    encoding: 'base64'
                })
                git_tree.push({
                    path: path,
                    sha: git_blob.sha,
                    mode: "100644",
                    type: "blob"
                })
            }
        }

        // Update Git Tree
        this.log("creating git tree...")
        const {data: {commit: last_commit}} = await octokit.repos.getBranch({
            owner,
            repo,
            branch
        })
  
        const {data: tree} = await octokit.git.createTree({
            owner,
            repo,
            tree: git_tree,
            base_tree: last_commit.sha
        })
  
        // Create Commit
        this.log("creating commit...")
        const {data: new_commit} = await octokit.git.createCommit({
            owner,
            repo,
            message: "create new project",
            tree: tree.sha,
            parents: [last_commit.sha]
        })

        const the_update = await octokit.git.updateRef({
            owner,
            repo,
            ref: "heads/"+this.branch,
            sha: new_commit.sha
        });

        this.stage = {}
        this.log("saved!")
    }

    /* JEKYLL-CMS */
    async listItems(collection:string): Promise<Array<{id: string}>>{
        const octokit = this.octokit;

        let {data: items} = await octokit.repos.getContent({
           owner:this.owner,
           repo: this.repo,
           ref: this.branch,
           path: "_"+collection,
           headers: {'If-None-Match': ''} //prevent cache
        })

        return items.map(blob=>new Object({id: blob.name}))
    }

    async listPages(): Promise<Array<{id: string, title: string}>>{
        const octokit = this.octokit;

        const branch = await octokit.repos.getBranch({
            owner: this.owner,
            repo: this.repo,
            branch: this.branch
        })

        const tree = await octokit.git.getTree({
            owner: this.owner,
            repo: this.repo,
            tree_sha: branch.data.commit.sha,
            recursive: true
        })

        function the_filter(path){
            // paths starts with underscore
            // eg: _hello/hello.md
            //     assets/_posts/posts.md
            const A = !path.split("/").some(p=>p[0]=="_" || p[0]==".")

            // keep .md or .html files only
            var re = /(?:\.([^.]+))?$/;
            let ext = re.exec(path)![1]
            let B = ext=="markdown" || ext=="md" || ext=="html"

            return A&&B&&path!="404.md"&&path!="README.md";
        }

        return tree.data.tree
        .filter(file=>the_filter(file.path))
        .map(function(file){
            return {
                id: file.path,
                title: pathParse(file.path).name
            }
        })
    }

    async listPosts(): Promise<Array<{id: string, title: string, date: string}>>{
        const items = await this.listItems("posts")

        return items.map(function(item){
            let {name} = pathParse(item.id);
            const date = name.slice(0,10)
            const title =  toTitleCase(name.slice(11).replace(/[-_]/g, " "))
            return {
                id: item.id, 
                title,
                date
            }
        })
    }

    async listProjects(): Promise<Array<{id:string, title:string}>>{
        this.log("listing projects...")
        const octokit = this.octokit;

        let {data: projects} = await octokit.repos.getContent({
           owner:this.owner,
           repo: this.repo,
           ref: this.branch,
           path: "_projects",
           headers: {'If-None-Match': ''} //prevent cache
        })

        return projects.map(function(blob){
            return {
                id: blob.name,
                title: toTitleCase(pathParse(blob.name).name.replace(/[-_]/g, " "))
            }
        })

    }

    async fetchPage(page_id): Promise<IPage>{
        // Get markdown file
        const filepath = page_id;
        const octokit = this.octokit
        let {data: result} = await octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            ref: this.branch,
            path: filepath,
            headers: {'If-None-Match': ''} //prevent cache
        })

        // Create Page from markdown
        
        const yaml = matter(b64DecodeUnicode(result.content))
        const {name} = pathParse(page_id)
        const title = yaml.data.title || name
        const page: IPage = {
            id: page_id,
            title: title,
            content: yaml.content,
            exclude: yaml.data.exclude || false
        }

        const validator = validate(page, page_schema);

        if(!validator.valid){
            throw new JekyllError(validator.toString());
        }

        return page
    }

    async fetchPost(post_id): Promise<IPost>{
        const collection = "posts"
        const octokit = this.octokit

        // get markdown file
        let {data: result} = await octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            ref: this.branch,
            path: `_${collection}/${post_id}`,
            headers: {'If-None-Match': ''} //prevent cache
        })

        const filename = post_id
        const md = b64DecodeUnicode(result.content)

        // Deserialize Project from markdown
        const yaml = matter(md)
        const title = yaml.data.title || pathParse(filename).name.slice(11, -1)
        const date = yaml.data.date || pathParse(filename).name.slice(0, 10)
        
        const post: IPost = {
            id: filename,
            title: title,
            date: date,
            content: yaml.content,
            image: yaml.data.image
        }

        const validator = validate(post, post_schema);

        if(!validator.valid){
            throw new JekyllError(validator.toString());
        }

        return post
    }

    async fetchProject(project_id: string): Promise<IProject>{
        // return Project object
        const octokit = this.octokit;

        // get markdown file
        let {data: result} = await octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            ref: this.branch,
            path: `_projects/${project_id}`,
            headers: {'If-None-Match': ''} //prevent cache
        })

        // Convert markdown to Project
        const yaml = matter(b64DecodeUnicode(result.content))

        const project: IProject = {
            id: project_id,
            title: yaml.data.title,
            content: yaml.content,
            gallery: yaml.data.gallery
        }

        const validator = validate(project, project_schema);
        if(!validator.valid){
            debugger
            throw new JekyllError(validator.toString());
        }

        return project
    }

    async saveNewPost(post:IPost, media_folder:string="media"): Promise<string>{
        let post_id = moment(post.date).format("YYYY-MM-DD")+"-"+this.slugify(post.title)+".md"
        return this.savePost(post_id, post, media_folder)
    }

    async saveNewProject(project: IProject, media_folder: string="media"): Promise<string>{
        let project_id = this.slugify(project.title)+".md"
        return this.saveProject(project_id, project, media_folder)
    }

    async savePost(post_id: string, post: IPost, media_folder: string): Promise<string>{
        const validator = validate(post, post_schema)
        if(!validator.valid){
            throw TypeError("Invalid Post")
        }
        
        // ADD POST TO STAGE
        // Create Image Attachment
        if(post.image && post.image.url.startsWith("data:")){
            const filename = post.image.title;
            const filepath = urljoin(media_folder, filename)

            const {data, mediatype} = this.parseDataUrl(post.image.url)
            if(mediatype.split("/")[0]!="image"){
                throw TypeError("this is not an image")
            }
            this.stage[filepath] = {
                content: data
            }
        }

        // Serialize Post to Markdown
        const filename = moment(post.date).format("YYYY-MM-DD")+"-"+this.slugify(post.title)+".md"

        const content:string = post.content;

        // Replace dataurl with filepath
        if(post.image && post.image.url.startsWith("data:")){
            post.image.url = urljoin(media_folder, post.image.title)
        }

        const frontmatter: {title: string, date: string, image?: IImage} = {
            title: post.title,
            date: post.date
        }
        if(post.image){
            frontmatter.image = post.image
        }

        const md = matter.stringify(content, frontmatter)

        this.stage[urljoin("_posts", filename)]={
            content: b64EncodeUnicode(md)
        }

        // PUSH PROJECT AND ATTACHMENTS to GITHUB
        await this.save()

        // LOG SUCCESS
        this.log(`post ${filename} succesfully uploaded to github`)
        return post_id;
    }

    async saveProject(project_id: string, project: IProject, media_folder:string="media"): Promise<string>{
        const validator = validate(project, project_schema)
        if(!validator.valid){
            throw TypeError("Invalid Project"+"\n"+validator.errors.map(err=>"- "+err.stack+"\n"))
        }
        
        // ADD PROJECT TO STAGE
        // create image attachments
        for(let fig of (project.gallery || [])){
            if(!fig.image.url.startsWith("data:")){
                continue;
            }

            let filename = fig.image.title;
            let filepath = urljoin(media_folder, filename)
            const {data, mediatype} = this.parseDataUrl(fig.image.url);
            if(mediatype.split("/")[0]!="image"){
                throw TypeError("This is not an image")
            }
            this.stage[filepath] = {
                content: data
            }
        }

        // create project markdown
        const filename = this.slugify(project.title)+".md"
        const filepath = urljoin("_projects", filename)

        const content:string = project.content;

        // Replace dataurl with filepath
        for(let fig of project.gallery || []){
            if(fig.image.url.startsWith("data:")){
                fig.image.url = urljoin(media_folder, fig.image.title)
            }
        }

        const frontmatter: {title: string, gallery?: Array<IFigure>} = {
            title: project.title,
            gallery: project.gallery
        }

        const markdown_text = matter.stringify(content, frontmatter)

        this.stage[filepath] = {
            path: filepath,
            content: b64EncodeUnicode(markdown_text),
        }

        // PUSH PROJECT AND ATTACHMENTS to GITHUB
        await this.save()

        // LOG SUCCESS
        this.log(`project ${filename} succesfully uploaded to github`)
        return filename;
    }

    async savePage(page_id:string, page: IPage): Promise<string>{
        const validator = validate(page, page_schema)
        if(!validator.valid){
            throw TypeError("Invalid Page"+"\n"+validator.errors.map(err=>"- "+err.stack+"\n"))
        }

        //
        const filepath = page_id;
        const content = page.content
        const frontmatter: {title:string, exclude:boolean} = {
            title: page.title,
            exclude: page.exclude
        }
        const markdown_text = matter.stringify(content, frontmatter)
        this.stage[filepath] = {
            content: b64EncodeUnicode(markdown_text)
        }

        // PUSH PAGE to GitHub
        await this.save()
        
        // LOG SUCCESS
        this.log(`page ${page_id} succesfully uploaded to github`)
        return page_id
    }

    async deletePost(post_id){
        this.log(`deleting post: ${post_id} ...`)
        const octokit = this.octokit;
        const owner = this.owner;
        const repo = this.repo;
        const branch = this.branch

        // get file with contents
        let response = await octokit.repos.getContent({
           owner: owner,
           repo: repo,
           ref: branch,
           path: `_posts/${post_id}`,
           headers: {'If-None-Match': ''} //prevent cache
        })
        // delete the file
        await octokit.repos.deleteFile({
            owner,
            repo,
            branch,
            path: `_posts/${post_id}`,
            message: "delete post",
            sha: response.data.sha,
        });

        this.log(`post deleted: ${post_id}`)
    }

    async deleteProject(project_id: string){
        this.log(`deleting project: ${project_id} ...`)
        const octokit = this.octokit;
        const owner = this.owner;
        const repo = this.repo;
        const branch = this.branch

        // get file with contents
        let response = await octokit.repos.getContent({
           owner: owner,
           repo: repo,
           ref: branch,
           path: `_projects/${project_id}`,
           headers: {'If-None-Match': ''} //prevent cache
        })
        // delete the file
        await octokit.repos.deleteFile({
            owner,
            repo,
            branch,
            path: `_projects/${project_id}`,
            message: "delete project",
            sha: response.data.sha,
        });

        this.log(`project deleted: ${project_id}`)
    }
}

export default Jekyll
export {post_schema, project_schema, figure_schema, image_schema}
export {b64EncodeUnicode, b64DecodeUnicode}
