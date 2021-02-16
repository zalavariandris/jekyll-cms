<template>
    <div>
        <header>
        </header>
        <header>
            <h2>Dashboard</h2>
        </header>

        <section>
            <h3>User</h3>
            <dl>
                <dt>token</dt>
                <dd>{{$store.state.host.token}}</dd>
            </dl>
        </section>

        <section>
            <h3>Site</h3>
            <dl>
                <dt>title</dt>
                <dd>eg: Judit Fischer</dd>
                <dt>tag line</dt>
                <dd>eg: Judit Fischer`s portfolio</dd>
            </dl>
        </section>

        <section>
            <h3>Host</h3>
            <dl>
                <dt>owner</dt>
                <dd>{{$store.state.host.owner}}</dd>
                <dt>repo</dt>
                <dd>{{$store.state.host.repo}}</dd>
                <dt>branch</dt>
                <dd>{{$store.state.host.branch}}</dd>
            </dl>
        </section>
    </div>
</template>

<style scoped lang="scss">
@import"../style/form.scss";
</style>

<script>
export default {
    data: function(){
        return {

        }
    }
}
</script>