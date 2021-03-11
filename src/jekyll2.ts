import sha1 from 'sha1'
import _ from 'lodash'
import { Octokit } from "@octokit/rest";
import {b64DecodeUnicode, b64EncodeUnicode} from "@/utils"
import YAML from 'yaml'
import pathParse from 'path-parse'
import matter from 'gray-matter'
import urljoin from 'url-join'

function sha_from_content(content){
    const blobSize = new Blob([content]).size
    const header = "blob "+blobSize+"\0"
    return sha1(header+content)
}

interface IBlob{
    sha: string;
    content?: string;
}

class Git{
    tree: {[key: string]: IBlob;};

    constructor(tree={}){
        this.tree = tree;
    }
}

interface IPage{
    title: string;
    date: string;
    id: string;
    categories: Array<string>;
    collection: string;
    tags: Array<string>;
    name: string;
    path: string;
    content: string;
    [key:string]: unknown;
};

class Page implements IPage{
    title: string;
    date: string;
    categories: Array<string>;
    collection: string;
    tags: Array<string>
    name: string;
    path: string;
    content: string;
    [key:string]: unknown;
    constructor(){
        this.title = "";
        this.date = "";
        this.categories = [""];
        this.collection = "";
        this.tags = [""];
        this.name= "";
        this.path= "";
        this.content= "";
    }

    get id():string{
        return this.title
    }
}

interface ISite{
    drafts: Array<[string, IBlob]>,
    includes: Array<[string, IBlob]>,
    layouts: Array<[string, IBlob]>,
    posts: Array<IPage>,
    data: Array<[string, IBlob]>,
    sass: Array<[string, IBlob]>,
    pages: Array<IPage>,
    static_files: Array<[string, IBlob]>,
    ignored: Array<[string, IBlob]>,
    collections: Array<string>,
    [collection:string]: Array<any>
}

async function pull({owner, repo, branch, token}):Promise<Git>{
    // pull git from github
    const octokit = new Octokit({
        auth: token
    }); 
    
    // TREE
    const branch_response = await octokit.repos.getBranch({
        owner, repo, branch
    })

    const tree_response = await octokit.git.getTree({
        owner, repo,
        tree_sha: branch_response.data.commit.sha,
        recursive: "true"
    })

    const tree = tree_response.data.tree.filter(b=>b.type==="blob")


    const git = new Git(Object.fromEntries(tree.map(blob=>{
        return [blob.path, {sha: blob.sha, content: undefined}]
    })))

    // BLOBS
    let promises:Array<Promise<void>> = []
    for(let [path, blob] of Object.entries(git.tree)){
        if(path!.endsWith(".md") || path!.endsWith(".yml") || path!.endsWith(".html")){
            const promise = octokit.repos.getContent({
                owner, repo,
                ref: branch,
                path: path,
                headers: {'If-None-Match': ''} //prevent cache
            }).then((response: any)=>{
                git.tree[path].content = response.data.content
            })
            promises.push(promise)
        }
    }

    await Promise.all(promises)
    return git
}

function getRawContentUrl(path: string, host:{owner: string, repo: string, branch: string}): string{
    return urljoin(`https://raw.githubusercontent.com/${host.owner}/${host.repo}/${host.branch}/`, path);
}

function page_from_path(path:string): IPage{
    const IsPost = path.startsWith("_posts/")
    const {dir, base, name} = pathParse(path);
    
    return {
        title: IsPost ? name.slice(11) : name,
        date: IsPost ? name.slice(0, 10) : "",
        id: path,
        categories: dir.split("/").filter(part=>part ? true : false),
        collection: "",
        tags: [],
        name: base,
        path: path,
        content: ""
    }
};

function site_from_git(git:Git):ISite{
    console.log("site_from_git")
    let site:ISite = {
        drafts: [],
        includes: [],
        layouts: [],
        posts: [],
        data: [],
        sass: [],
        pages: [],
        static_files: [],
        ignored: [],
        collections: []
    };
    
    // get config
    if(!git){debugger}
    const result = git.tree["_config.yml"].content
    if(!result){debugger;}
    const config = YAML.parse(b64DecodeUnicode(result))
    site = {
        ...site,
        ...config,
        collections: Object.keys(config.collections)
    };

    // create empty collections from config
    for(let name of site.collections){
        site[name] = []
    }

    const IsCollectionItem=(path)=>{
        return site.collections.some(name=>path.startsWith("_"+name+"/") && !path.startsWith("_posts/"))
    }

    const IsIgnored=(path)=>{
        return path.split("/").some(part=>"._#~".indexOf(part[0])>=0)
    }

    for(let [path, blob] of Object.entries(git.tree)){

        if(path.startsWith("_drafts") &&
            (path.endsWith(".md") || path.endsWith(".html"))){
            site.drafts.push([path, blob])
        }
        else if(path.startsWith("_includes") &&
                (path.endsWith(".md") || path.endsWith(".html"))){
            site.includes.push([path, blob])
        }
        else if(path.startsWith("_layouts") &&
                (path.endsWith(".md") || path.endsWith(".html"))){
            site.layouts.push([path, blob])
        }

        else if(IsCollectionItem(path) &&
               (path.endsWith(".md") || path.endsWith(".html"))){

            // COLLECTIONS + POSTS
            const collection = pathParse(path).dir.slice(1)

            
            const result = git.tree[path].content
            if(!result) debugger

            const md = matter( b64DecodeUnicode(result) )
        
            const frontmatter = md.data
            const text = md.content

            const from_path = page_from_path(path)                        
            const page = {...from_path, ...frontmatter, collection, content: text}
            
            site[collection].push(page)
        }
        else if(path.startsWith("_data")){
            site.data.push([path, blob])
        }
        else if(path.startsWith("_sass")){
            site.sass.push([path, blob])
        }
        else if(path.startsWith("_site")){
            // skip generated site
        }
        else if(IsIgnored(path)){
            // ignored files
            site.ignored.push([path, blob])
            
        }else if(path.endsWith(".md") || path.endsWith(".html")){
            // PAGES
            const result = git.tree[path].content
            if(!result) debugger
            const md = matter( b64DecodeUnicode(result) )
            const frontmatter = md.data
            const text = md.content
            
            const from_path = page_from_path(path)                        
            const page = {...from_path, ...frontmatter, content: text}

            site.pages.push(page)

        }else{
            site.static_files.push([path, blob])
        }
    }

    return site
}

async function push({owner, repo, branch, token, git, message:string="update with CMS"}:{owner: string, repo: string, branch:string, token: string, git: Git, message: string}):Promise<void>{
    // Push to github
    const octokit = new Octokit({
        auth: token
    }); 

    //
    // TREE
    console.log("push...")
    console.log("get tree...")
    const branch_response = await octokit.repos.getBranch({
        owner, repo, branch
    })

    const tree_response = await octokit.git.getTree({
        owner, repo,
        tree_sha: branch_response.data.commit.sha,
        recursive: "true"
    })

    const origin_tree = tree_response.data.tree.filter(b=>b.type==="blob")

    // BLOBS
    // upload new blobs
    
    const origin_tree_set = new Set(origin_tree.map(blob=>blob.sha))
    const new_blobs = Object.entries(git.tree).filter(([path, blob])=>!origin_tree_set.has(blob.sha))
    console.log(`uploading ${new_blobs.length} new blob...`, )
    await Promise.all(new_blobs.map(([path, blob])=>octokit.git.createBlob({
        owner: owner,
        repo: repo,
        content: git.tree[path].content!,
        encoding: "base64"
    })))

    // TREE
    const {data: {commit: last_commit}} = await octokit.repos.getBranch({
        owner,
        repo,
        branch
    })

    const tree = await octokit.git.createTree({
        owner,
        repo,
        tree: Object.entries(git.tree).map(function([path, blob]){
            return {
                path: path,
                sha: blob.sha,
                mode: "100644",
                type: "blob"
            }
        }),
        // base_tree: last_commit.sha
    })
    
    // Create Commit
    console.log('createing commit...')
    const {data: new_commit} = await octokit.git.createCommit({
        owner,
        repo,
        message: "push CMS",
        tree: tree.data.sha,
        parents: [last_commit.sha]
    })

    await octokit.git.updateRef({
        owner,
        repo,
        ref: "heads/"+branch,
        sha: new_commit.sha
    });
    console.log("done!")
}

function site_to_git(site:ISite):Git{
    const git = new Git();
    for(let [path, draft] of site.drafts){
        git.tree[path] = draft
    }

    for(let [path, include] of site.includes){
        git.tree[path] = include
    }
    for(let [path, layout] of site.layouts){
        git.tree[path] = layout
    }
    for(let [path, data] of site.data){
        git.tree[path] =  data
    }
    for(let [path, sass] of site.sass){
        git.tree[path] = sass
    }
    // for(let post of this.site.posts){
    //     tree.push(post)
    // }
    for(let collection of site.collections){
        for(let item of site[collection]){
            let {content, ...frontmatter} = item

            // remove defaults from frontmatter
            const defaults_from_path = page_from_path(item.path)
            for(let key in defaults_from_path){
                if(JSON.stringify(frontmatter[key]) == JSON.stringify(defaults_from_path[key])){
                    delete frontmatter[key]
                }
            }      

            let md = matter.stringify(content, frontmatter)

            const sha = sha_from_content(md)
            git.tree[item.path] = {
                sha,
                content: b64EncodeUnicode(md)
            }
        }
    }
    for(let page of site.pages){
        let {content, ...frontmatter} = page

        // remove defaults from frontmatter
        const defaults_from_path = page_from_path(page.path)
        for(let key in defaults_from_path){
            if(JSON.stringify(frontmatter[key]) == JSON.stringify(defaults_from_path[key])){
                delete frontmatter[key]
            }
        }        

        // create markdown
        let md = matter.stringify(content, frontmatter)

        const sha = sha_from_content(md)
        git.tree[page.path] = {
            sha,
            content: b64EncodeUnicode(md)
        }
    }
    for(let [path, blob] of site.static_files){
        git.tree[path] = blob
    }
    for(let [path, blob] of site.ignored){
        git.tree[path] = blob
    }
    
    return git
}

interface Change{
    [path:string]: 'added' | 'removed' | 'updated' | null
}

function diff(git:Git, origin:Git):Change{
    let change: Change = {};
    const current_paths = new Set(Object.keys(git.tree))
    const origin_paths = new Set(Object.keys(origin.tree))
    for(let [path, blob] of Object.entries(git.tree)){
        // is added
        
        if(!origin_paths.has(path)){
            change[path] = 'added'
        }else if(blob.sha != origin.tree[path].sha){
            change[path] = 'updated'
        }
    }

    for(let path of Object.keys(origin.tree)){
        if( !current_paths.has(path) ){
            change[path] = 'removed'
        }
    }

    return change
}

export {Git, IBlob, sha_from_content, pull, push, diff, ISite, IPage, Page, site_from_git, site_to_git, page_from_path, getRawContentUrl}