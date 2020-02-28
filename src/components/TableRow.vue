<template>
    <tr 
        @click="clicked" 
        @mouseover="over"
        @mouseout="out"
        :class="rowClass(row.data)"
    >
        <table-cell
            v-for="(column) in columns"
            :show="!column.hidden"
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
            },
            over(){
                this.$emit('over', this.row)
            },
            out(){
                this.$emit('out', this.row)
            },
        }

    };
</script>
