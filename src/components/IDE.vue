<template>
    <div id="IDE">

        <div class="tree dark">
            <ul>
                <li>
                    <button @click="on_add_file">add file</button>
                </li>

                <tree-menu label="root" :nodes="nodes"></tree-menu>
            </ul>
        </div>

        <div class="my-editor">
            <h6>{{editing}}</h6>
            <prism-editor v-model="git.content[editing]" :highlight="highlighter" line-numbers></prism-editor>
        </div>

        <div>
            <h6>{{previewing}}</h6>
            <iframe :src="dataurl(render(previewing))"/>
        </div>
    </div>
</template>

<style>

/* required class */
  .my-editor {
    /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
    background: #2d2d2d;
    color: #ccc;

    /* you must provide font-family font-size line-height. Example: */
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;

    white-space: nowrap;
  }

  /* optional class for removing the outline */
  .prism-editor__textarea:focus {
    outline: none;
  }

#IDE{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;

    display: flex;
}

#IDE>*:not(:first-child){
    flex: 1 1 0px;
}


#IDE>*{
    border: none;
    border-left: 0.5px solid grey;
}

#IDE iframe{
    border: none;
}

a{
    color: white;
}

li{
    /* display: flex; */
    justify-items: space-between;
}
li a{
    flex-grow: 1;
}


.dark{
    background: rgb(60, 60, 60);
    color: white;
}

.md{
    animation: none;
}

.md ul{
    list-style: disc;
    padding-left: 2em;
}

button.icon{
    background: none;
    border: none;
    color: inherit;
}

button:hover{
    color: rgb(41, 228, 197);
}

button:focus{
    outline: none;
    color: rgb(41, 228, 197);
}
</style>

<script>
import Vue from 'vue'

import matter from 'gray-matter'
import { Liquid } from 'liquidjs';
import marked from 'marked'
var liquid = new Liquid();

// import Prism Editor
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles


const TreeMenu = Vue.component("tree-menu",     {
    props: [ 'label', 'path', 'nodes' ],
    name: 'tree-menu',
    template:`
      <ul class="tree-menu">
        <li>
        <span>
          <button class="icon">o</button>
          {{ label }}
          <button class="icon">X</button>
        </span>
        <tree-menu 
            v-for="node in nodes" 
            :nodes="node.nodes" 
            :label="node.label"
            :path="node.path"
            :key="node.label"
            >
        </tree-menu>
        </li>
    </ul>`
  })

export default {
    components: {
      PrismEditor,
      TreeMenu
    },
    data: function(){
        return {
            editing: "",
            previewing: "",
            src: "",
            git: {
                tree: [],
                content: {}
            }
        }
    },

    computed: {
        nodes(){
            let result = [];
            let level = {result};
            const paths = this.git.tree.map(blob=>blob.path);

            paths.forEach(path => {
            path.split('/').reduce((r, label, i, a) => {
                if(!r[label]) {
                r[label] = {result: []};
                r.result.push({path, label, nodes: r[label].result})
                }
                
                return r[label];
            }, level)
            })

            return result;
        },
        site(){

            //posts
            let posts = Object.entries(ide.git.content)
            .filter(([path, content])=>path.startsWith("_posts/"))
            .map(function([path, content]){
                let yaml = matter(content)
                return {
                    title: yaml.data.title,
                    data: yaml.data.date,
                    ...yaml.data,
                    content: yaml.content
                };
            })

            //collections
            let collections = Object.entries(ide.git.content)
            .filter()

            return {
                posts
            }
        }
    },

    mounted: function(){
        window.ide = this;
        if(localStorage['git']){
            try{
                this.git = JSON.parse(localStorage['git'])
            }catch(err){
                alert(err.toString())
            }
        }
    },

    watch: {
        git:{
            handler: function (val){
                localStorage['git'] = JSON.stringify(val);
            },
            deep: true
        }
    },

    methods: {
        highlighter(code) {
            const ext = pathParse(this.editing).ext.slice(1)
            if(ext in languages){
                return highlight(code, languages[ext]);
            }else{
                return highlight(code, languages.js);
            }
        },
        render(path, sub_page={}){
            try{
                // get source code
                if(!(path in this.git.content)){
                    console.warn("no content for ", path)
                }
                let src = this.git.content[path]

                let yaml = matter(src)
                let data = yaml.data
                let content = yaml.content

                let result = liquid.parseAndRenderSync(content, {site: this.site, page: {...data, ...sub_page.page}, content: sub_page.content});
                if(path.endsWith(".md")){
                    result = marked(result)
                }

                if(data.layout){
                    result = this.render("_layouts/"+data.layout, {site: this.site, page: data, content: result})
                }

                return result

            }catch(err){
                return err.toString();
            }
        },

        dataurl: function(data, mime="text/html"){
            for(let blob of this.git.tree){
                if(data.match(blob.path)){
                    let sub_mime = "text/html"
                    if(blob.path.endsWith(".css")){
                        sub_mime = "text/css"
                    }
                    data = data.replaceAll('="'+blob.path+'"', '="'+this.dataurl(this.git.content[blob.path])+'"', sub_mime)
                }
            }
            return "data:"+mime+";charset=utf-8,"+escape(data)
        },

        on_add_file(e){
            const filepath = prompt("filepath")
            if(filepath){
                this.git.tree.push({
                    path: filepath
                })
                this.git.content[filepath] = "";
            }
        },

        remove_blob(blob){
            const idx = this.git.tree.findIndex(b=>b.path==blob.path)
            if(idx>=0){
                this.git.tree.splice(idx, 1)
            }
            delete this.git.content[blob.path]
        }
    }

}
</script>