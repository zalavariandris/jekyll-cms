import Jekyll from "@/jekyll"
import { makeID } from "@/utils"
import {b64DecodeUnicode} from "@/Jekyll"

import {validate} from 'jsonschema'
import urljoin from 'url-join'
import matter from 'gray-matter'
import axios from 'axios'

import token from '../token'

const baseurl = "https://api.github.com/repos/"
axios.defaults.headers.common['Authorization'] = `zalavariandris ${token}`;
axios.defaults.headers.common['If-None-Match'] = '' //prevent cache

const jekyll = new Jekyll({
    owner: "zalavariandris",
    repo: "cms-sandbox",
    branch: "master",
    token
})

test("list pages from github", async()=>{
    const pages = await jekyll.listPages()

    const validator = validate(pages, {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: {type: "string"},
                title: {type: "string"}
            },
            required: ['id', 'title']
        }
    })

    expect(pages.length).toBeGreaterThan(0)
    console.log("errors:", validator.errors.map(err=>err.stack))
    expect(validator.valid).toBe(true)
})

test("fetch page", async()=>{
    const page = await jekyll.fetchPage("news.md")
    
    expect(page.id).toBe("news.md")
    expect(page.title).toBe("news")
    expect(page.exclude).toBe(true)
    expect(page.content).toEqual(expect.anything())
})

test("update existing page content", async()=>{
    const page = await jekyll.fetchPage("random-testpage.md")
    const content = "the random content of the test page - "+makeID()
    const new_page = {
        title: page.title,
        exclude: page.exclude,
        content
    }

    await expect(jekyll.savePage(page.id!, new_page))
    .resolves.toBe(page.id)

    const filename = page.id

    // get created project
    const url = urljoin(baseurl, jekyll.owner, jekyll.repo, "contents", filename, "?ref="+jekyll.branch)
    const get_response = await axios(url)
    const result = matter(b64DecodeUnicode(get_response.data.content))

    expect(result.content.trim()).toBe(content.trim())
})