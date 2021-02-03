import Jekyll from "@/jekyll"
import {b64DecodeUnicode, b64EncodeUnicode} from '@/jekyll'
import {randomImage, makeID} from '@/utils'

import matter from 'gray-matter'
import axios from 'axios'
import {validate} from 'jsonschema'
import moment from 'moment'
import urljoin from 'url-join'

import token from '../token'

import 'jest-canvas-mock'

console.log = jest.fn();

axios.defaults.headers.common['Authorization'] = `zalavariandris ${token}`;

const jekyll = new Jekyll({
    owner: "zalavariandris",
    repo: "cms-sandbox",
    branch: "master",
    token
})

const baseurl = "https://api.github.com/repos/"

axios.defaults.headers.common['Authorization'] = `zalavariandris ${token}`;

test("list posts from GitHub", async ()=>{
    const posts = await jekyll.listPosts()

    const validator = validate(posts, {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: {type: "string"},
                title: {type: "string"},
                image: {
                    type: 'object',
                    properties: {
                        'url': {type: 'string'},
                        'title': {type: 'string'},
                        'alt': {type: 'string'}
                    },
                    required: ['url']
                }
            },
            required: ['id', 'title']
        }
    })

    expect(posts.length).toBeGreaterThan(0)
    expect(validator.valid).toBe(true)
})

test("fetch post from github", async()=>{
    const post_id = "2019-01-15-masa.md"
    const post = await jekyll.fetchPost(post_id)


    expect(post.title).toBe("Masa")
    expect(post.date).toBe("2019-01-15")
    expect(post.content.trim()).toBe("Az első fotó Másáról.".trim())
    expect(post.image).toStrictEqual({
        url: "media/masa 0115.jpg",
        title: "masa 0115.jpg",
        alt: ""
    })
})

test.skip("save new post with no images", async()=>{
    // 1) Create Post
    const title = "Bare bone new Post-"+makeID();
    const date = moment().format("YYYY-MM-DD")
    const content = "this is a new post without images"

    // 2) Save Post
    const filename = await jekyll.saveNewPost({title, date,  content})

    // 3) check created post
    // expect proper markdown file
    const url = urljoin(baseurl, jekyll.owner, jekyll.repo, "contents", "_posts", filename, "?ref="+jekyll.branch)
    const get_response = await axios(url)
    const result = matter(b64DecodeUnicode(get_response.data.content))

    expect(result.content.trim()).toBe(content.trim());
    expect(result.data.title).toBe(title);
    expect(result.data.date).toBe(date);
})

test("save and delete new post with no images sucessfully", async()=>{
    // 1) Create Post
    const title = "Bare bone new Post-"+makeID();
    const date = moment().format("YYYY-MM-DD");
    const content = "this is a new post without images";
    const gallery = [];

    // 2) Save Post
    const filename = await jekyll.saveNewPost({title, date, content})

    // get created Post
    // expect proper markdown file
    const url = urljoin(baseurl, jekyll.owner, jekyll.repo, "contents", "_posts", filename, "?ref="+jekyll.branch)
    const get_response = await axios(url)
    expect(atob(get_response.data.content))
    .toBe(matter.stringify(content, {title, date}))
    
    // 4) DELETE Post
    await expect(jekyll.deletePost(filename))
    .resolves.toBe(undefined)
    
    await expect(axios(url))
    .rejects.toThrow("Request failed with status code 404")
}, 10000)

test("save and delete new post with images succesfully", async()=>{
    // 1) Create Post
    const title = "Bare bone new Post-"+makeID();
    const date = moment().format("YYYY-MM-DD");
    const content = "this is a new post with images"
    const image = {title: "img.jpg", url: randomImage(), alt: ""}

    // 2) Save Post
    const filename = await jekyll.saveNewPost({title, date, content, image})

    // get created post
    // expect proper markdown file
    const url = urljoin(baseurl, jekyll.owner, jekyll.repo, "contents", "_posts", filename, "?ref="+jekyll.branch)
    const get_response = await axios(url)    
    expect(atob(get_response.data.content))
    .toBe(matter.stringify(content, {title, date, image}))
    
    // 4) DELETE Post
    await expect(jekyll.deletePost(filename)).resolves
    .toBe(undefined)

    await expect(axios(url))
    .rejects.toThrow("Request failed with status code 404")
}, 15000)

test("save post with empty title throws error", async()=>{
    return expect(jekyll.saveNewPost({title: "", date: moment().format("YYYY-MM-DD"), content: "has content"}))
    .rejects.toThrow("Invalid Post")
})