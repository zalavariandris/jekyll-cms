<template>
    <v-container>
        <v-row>
            <v-file-input 
              hide-input
              multiple
              @change="onFilesChange"
            ></v-file-input>
        </v-row>
        <v-row>
            <draggable 
              v-model="content" 
              style="display: flex; flex-wrap: wrap; gap: 1rem;"
              @change="onSortChange"
            >
            <v-card 
                outlined
                style="width: 10rem;" 
                v-for="card in content" 
                :key="card.image"
            >
                <v-img :src="card.image"></v-img>
                <v-card-text>
                    <v-textarea 
                      style="font-size: inherit;" 
                      v-model="card.text"
                      auto-grow
                      rows="1"
                    ></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-btn
                        icon
                        @click="removeFigure(fig)"
                    >
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
            </draggable>
        </v-row>
    </v-container>
</template>

<style scoped>

</style>

<script lang="ts">
import draggable from 'vuedraggable'
import Vue from 'vue'
import {resizeImage} from '../utils'
export default Vue.extend({
    name: "card-input",
    components: {draggable},
    props: {
        value: Array,
        multiple: Boolean
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    data(){
        return {
            content: this.value
        }
    },
    methods: {
        onSortChange(){
            this.$emit('input', this.content)
        },

        onFilesChange(files){
            if (files && files[0]) {
                for(let file of files){
                    var reader = new FileReader();
                    reader.addEventListener('load', e=>{
                        let dataURL = e.target!.result

                        resizeImage(dataURL)
                        .then(dataURL=>{
                            this.content.push({
                                image: {
                                    src: dataURL,
                                    url: dataURL,
                                    title: file.name.startsWith("_") ? file.name.slice(1) : file.name,
                                    alt: ""
                                },
                                caption: ""
                            })
                            this.$emit('input', this.content)
                        })
                        
                    })                    
                    reader.readAsDataURL(file); // convert to base64 string
                }
            }
        },

        removeFigure(figure){
            const idx = this.content.indexOf(figure)
            if(idx>=0){
                this.content.splice(idx, 1)
            }
            this.$emit('input', this.content)
        }
    }
})
</script>