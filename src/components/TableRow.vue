<template>
    <tr 
        @click="clicked" 
        :class="rowClass(row.data)"
    >
        <table-cell
            v-for="(column) in visibleColumns"
            :key="row.vueTableComponentInternalRowId + '-' + column.index"
            :row="row"
            :column="column"
        ></table-cell>
    </tr>
</template>

<script>
        // v-tooltip.bottom.start="{content: tooltip, delay: 0}"
    import TableCell from './TableCell';

    export default {
        props: ['columns', 'row', 'tooltipField', 'rowClass'],

        components: {
            TableCell,
        },

        computed: {
            visibleColumns() {
                return this.columns.filter(column => ! column.hidden);
            },

            tooltip(){
                if(!this.tooltipField) return 

                return this.row.data[this.tooltipField]
            },
        },

        methods: {
            clicked(){
                this.$emit('click', this.row)
            }
        }

    };
</script>
