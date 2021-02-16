<template>
    <div class="card modal">
        <header>
            <h1>Login to Jekyll-CMS</h1>
            <p>and connect to github pages</p>
        </header>
        
        <form @submit.prevent="connect">
            <section>
                <h3>Authentication</h3>
                <div class="field">
                    <label>token</label>
                    <div class="control">
                        <input v-model="token" type="text">
                    </div>
                </div>
            </section>

            <section>
                <h3>Host</h3>
                <div class="field">
                    <label>owner</label>
                    <div class="control">
                        <input v-model="owner" type="text">
                    </div>
                </div>

                <div class="field">
                    <label>repo</label>
                    <div class="control">
                        <input v-model="repo" type="text">
                    </div>
                </div>

                <div class="field">
                    <label>branch</label>
                    <div class="control">
                        <input v-model="branch" type="text">
                    </div>
                </div>
            </section>

            <div class="control">
                <input type="submit" class="is-primary" value="Connect"/>
            </div>
        </form>
    </div>
</template>

<style scoped lang="scss">
@import "../style/form.scss";

</style>

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
            axios("./admin.config.json")
            .then(response=>{
                const {owner, repo, branch} = response.data.host;
                this.owner = owner;
                this.repo = repo;
                this.branch = branch
                if(localStorage.getItem('accessToken')){
                    this.token = localStorage.getItem('accessToken')
                }
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