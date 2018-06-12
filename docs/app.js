import Vue from 'vue';
import TableColumnFilter from '../src/components/TableColumnFilter';
import TableComponent from '../src/components/TableComponent';
import TableColumn from '../src/components/TableColumn';
// import Tooltip from 'vue-directive-tooltip';
import DemoPage from './demo-page.vue'

// Vue.use(Tooltip);

new Vue({
    el: '#app',

    components: {
        TableColumn,
        TableComponent,
        TableColumnFilter,
        DemoPage
    },
});
