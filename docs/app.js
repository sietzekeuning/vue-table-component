import Vue from 'vue';
import TableColumnFilter from '../src/components/TableColumnFilter';
import TableComponent from '../src/components/TableComponent';
import TableColumn from '../src/components/TableColumn';

import DemoPage from './demo-page.vue'

new Vue({
    el: '#app',

    components: {
        TableColumn,
        TableComponent,
        TableColumnFilter,
        DemoPage
    },
});
