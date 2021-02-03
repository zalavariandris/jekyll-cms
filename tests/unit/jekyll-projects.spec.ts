import Jekyll from "@/jekyll"
import {randomImage, makeID} from '@/utils'

import matter from 'gray-matter'
import token from '../token'
import axios from 'axios'
import {validate} from 'jsonschema'
import urljoin from 'url-join'
import 'jest-canvas-mock'

console.log = jest.fn();

const jekyll = new Jekyll({
    owner: "zalavariandris",
    repo: "cms-sandbox",
    branch: "master",
    token
})


axios.defaults.headers.common['Authorization'] = `zalavariandris ${token}`;

test("list projects from github", async()=>{
    const projects = await jekyll.listProjects()

    const validator = validate(projects, {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                title: {type: 'string'}
            },
            required: ['id', 'title']
        }
    })

    expect(projects.length).toBeGreaterThan(0)
    expect(validator.valid).toBe(true)
})

test("fetch project from github", async()=>{
    const project_id = "almodni_alszom.md"
    const project = await jekyll.fetchProject(project_id)

    expect(project).toStrictEqual({
        id: "almodni_alszom.md",
        title: "Álmodni alszom",
        content: "",
        gallery: [
            {
                image: {
                    alt: "",
                    title: "IMG_7142_1.jpg",
                    url: "/_uploads/IMG_7142_1.jpg"
                },
                caption: null
            },
            {
                image: {
                    alt: "",
                    title: "IMG_7305.jpg",
                    url: "/_uploads/IMG_7305.jpg"
                },
                caption: null
            }
        ]
    })
})

test.skip("save new project with no images", async()=>{
    // 1) Create Project
    const title = "Bare bone new Project-"+makeID();
    const content = "this is a new project without images"
    const gallery = []
    const id = jekyll.slugify(title)+".md"

    // 2) Save Project
    const filename = await jekyll.saveNewProject({id, title, content, gallery})
    console.assert(id==filename)

    // get created project
    const url = urljoin("https://api.github.com/repos/", jekyll.owner, jekyll.repo, "contents", "_projects", filename, "?ref="+jekyll.branch)
    const get_response = await axios(url)

    // expect proper markdown file
    expect(atob(get_response.data.content)).toBe(matter.stringify(content, {title, gallery}))
})

test("save and delete new project with no images sucessfully", async()=>{
    // 1) Create Project
    const title = "Bare bone new Project-"+makeID();
    const content = "this is a new project without images"
    const gallery = []

    // 2) Save Project
    const filename = await jekyll.saveNewProject({title, content, gallery})

    // get created project
    // expect proper markdown file
    const url = urljoin("https://api.github.com/repos/", jekyll.owner, jekyll.repo, "contents", "_projects", filename, "?ref="+jekyll.branch)
    const get_response = await axios(url)
    expect(atob(get_response.data.content))
    .toBe(matter.stringify(content, {title, gallery}))
    
    // 4) DELETE Project
    await expect(jekyll.deleteProject(filename))
    .resolves.toBe(undefined)
    
    await expect(axios(url))
    .rejects.toThrow("Request failed with status code 404")
}, 10000)

test("save and delete new project with images succesfully", async()=>{
    // 1) Create Project
    const title = "Bare bone new Project-"+makeID();
    const content = "this is a new project without images"
    const gallery = [{
        image: {title: "img.jpg", url: randomImage(), alt: ""},
        caption: "random image"
    }]

    // 2) Save Project
    const filename = await jekyll.saveNewProject({title, content, gallery})

    // get created project
    // expect proper markdown file
    const url = urljoin("https://api.github.com/repos/", jekyll.owner, jekyll.repo, "contents", "_projects", filename, "?ref="+jekyll.branch)
    const get_response = await axios(url)    
    expect(atob(get_response.data.content))
    .toBe(matter.stringify(content, {title, gallery}))
    
    // 4) DELETE Project
    await expect(jekyll.deleteProject(filename)).resolves
    .toBe(undefined)

    await expect(axios(url))
    .rejects.toThrow("Request failed with status code 404")
}, 15000)

test("save project with empty title throws error", async()=>{
    return expect(jekyll.saveNewProject({title: "", content: "has content", gallery: []}))
    .rejects.toThrow("Invalid Project")
})