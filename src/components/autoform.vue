<template>
    <!-- OBJECT recursive -->
    <v-item-group v-if="content && schema.type=='object'">
        <label>{{name}}</label>
        <autoform
            :ref="key"
            :value="content[key]"
            @input="onObjectInput"
            v-for="[key, field] in Object.entries(schema.properties)"
            :key="key"
            :schema="field"
            :name="key"
            style="margin-left: 1rem;"
            >
        </autoform>
    </v-item-group>
    
    <!-- <v-text-field v-else-if="schema.type=='string'" :label="name" v-model="content" type="text"/>
    <v-textarea   v-else-if="schema.type=='text'"   :label="name" v-model="content" rows="1" auto-grow></v-textarea>
    <v-file-input v-else-if="schema.type=='file'"   :label="name" v-model="content"/>   -->

    <input  v-else-if="schema.type=='string'" type="text" :name="name" :placeholder="name" :value="content" @input="onInput"/> 
    <input  v-else-if="schema.type=='file'" type="file" :name="name" :placeholder="name" :value="content" @input="onInput"/>    
    <textarea  v-else-if="schema.type=='text'" :name="name" :placeholder="name" :value="content" @input="onInput"/>   
        
</template>

<script>
export default {
    name: 'autoform',
    props: ['value', 'schema', 'name'],
    data(){
        return {
            content: this.value
        }
    },

    methods: {
        onInput(event){
            this.content = event.target.value
            const new_value = event.target.value
            this.$emit('input', new_value, this)
        },
        onObjectInput(value, component){
            const new_value = component.content
            const key = component.name
            this.content[key] = new_value
            this.$emit('input', this.content, this) 
        },
        onArrayInput(event){

        }
        // updateField(key, value){
        //     debugger
        //     this.content[key] = value
        //     debugger
        //     this.$emit('input', this)
        // },
    }
}
</script>