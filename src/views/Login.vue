<template>
    <v-container fill-height fluid style="width: min-content;">
  <v-row align="center">
      <v-col>
    <v-card flat>
        <v-toolbar flat>
            <v-toolbar-title>
                Login to Jekyll-CMS/v-toolbar-title
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
            <v-form @submit.prevent="connect">
                <v-subheader>User</v-subheader>
                <v-text-field
                    v-model="token"
                    label="token"
                ></v-text-field>

                <v-subheader>Host</v-subheader>
                <v-text-field
                    v-model="owner"
                    label="owner"
                ></v-text-field>
                <v-text-field
                    v-model="repo"
                    label="repo"
                ></v-text-field>
                <v-text-field
                    v-model="branch"
                    label="branch"
                ></v-text-field>

                <v-btn
                    class="mr-4"
                    type="submit"
                    color="primary"
                    outlined
                >login</v-btn>
            </v-form>
        </v-card-text>
    </v-card>
    </v-col>
    </v-row>
</v-container>
</template>

<script>
export default {
    data(){
        return {
            owner: "",
            repo: "",
            branch: "",
            token: ""
        }
    },

    mounted(){
        this.fetch()
    },

    methods: {
        fetch(){
            if(localStorage.getItem('accessToken')){
                this.token = localStorage.getItem('accessToken')
            }

            axios("./admin.config.json")
            .then(response=>{
                const {owner, repo, branch} = response.data.host;
                this.owner = owner;
                this.repo = repo;
                this.branch = branch
            })
        },

        connect(){
            this.$store.dispatch('login', {
                owner: this.owner,
                repo: this.repo,
                branch: this.branch,
                token: this.token
            }).then(response=>{
                localStorage.setItem('accessToken', this.token)
                this.$router.push({name: "site"})
            })
            .catch(error=>{
                alert(error.message)
            })
        }
    }
}
</script>