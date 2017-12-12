<template>
    <tr @click="clicked">
        <table-cell
            v-for="(column, index) in visibleColumns"
            :key="row.vueTableComponentInternalRowId + '-' + column.index"
            :row="row"
            :column="column"
        ></table-cell>
    </tr>
</template>

<script>
    import TableCell from './TableCell';

    export default {
        props: ['columns', 'row'],

        components: {
            TableCell,
        },

        computed: {
            visibleColumns() {
                return this.columns.filter(column => ! column.hidden);
            },

            
        },

        methods: {
            clicked(){
                this.$emit('click', this.row)
            }
        }

    };
</script>
