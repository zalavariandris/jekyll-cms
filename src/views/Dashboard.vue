<template>
    <div>
        <header>
        </header>
        <header>
            <h2>Dashboard</h2>
        </header>

        <v-form @submit.prevent="connect">
            <h3>User</h3>
            <v-text-field
            v-model="$store.state.user.token"
            label="token"
            ></v-text-field>

            <v-divider></v-divider>

            <h3>Host</h3>

            <v-text-field
            v-model="$store.state.host.owner"
            label="owner"
            ></v-text-field>
            <v-text-field
            v-model="$store.state.host.repo"
            label="repo"
            ></v-text-field>
            <v-text-field
            v-model="$store.state.host.branch"
            label="branch"
            ></v-text-field>
            <v-btn
                class="mr-4"
                type="submit"
                color="primary"
            >
                login
            </v-btn>

        </v-form>

        <section>
            <h3>Site</h3>
            <dl>
                <dt>title</dt>
                <dd>eg: Judit Fischer</dd>
                <dt>tag line</dt>
                <dd>eg: Judit Fischer`s portfolio</dd>
            </dl>
        </section>
    </div>
</template>

<script>
export default {
    methods: {
        connect(){
            this.$store.dispatch("login")
        }
    }
}
</script>