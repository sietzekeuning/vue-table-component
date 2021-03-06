<template>
    <div class="table-component">

        <div class="pagination-and-filters-header">
            <slot name="clear-filter-link"></slot>
        </div>

        <div v-if="showFilter && filterableColumnExists" class="table-component__filter">
            <input
                    :class="fullFilterInputClass"
                    type="text"
                    v-model="filter"
                    :placeholder="filterPlaceholder"
            >
            <a
                    v-if="filter"
                    @click="filter = ''"
                    class="table-component__filter__clear"
            >×</a>
        </div>

        <div class="table-component__table-wrapper">
            <table :class="fullTableClass">
                <caption v-if="showCaption" class="table-component__table__caption" role="alert" aria-live="polite">
                    {{ ariaCaption }}
                </caption>
                <thead :class="fullTableHeadClass">
                <tr>
                    <table-column-header
                            @click="changeSorting"
                            v-for="column in columns"
                            :key="column.show"
                            :sort="sort"
                            :column="column"
                    ></table-column-header>
                </tr>
                </thead>

                <!-- <table-filters></table-filters> -->
                <thead>
                    <tr>
                        <slot name="filters"></slot>
                    </tr>
                </thead>

                <tbody :class="fullTableBodyClass">
                <table-row
                        v-for="row in displayedRows"
                        :key="row.data.vueTableComponentInternalRowId"
                        :row="row"
                        :columns="columns"
                        :tooltip-field="tooltipField"
                        :row-class="rowClass"
                        @click="rowClick(row)"
                        @over="rowOver(row)"
                        @out="rowOut(row)"
                ></table-row>
                </tbody>
            </table>
        </div>

        <div v-if="this.loading" class="loading">
            <slot name="loading">Loading..</slot>
        </div>

        <div v-if="!this.loading && displayedRows.length === 0" class="table-component__message">
            {{ filterNoResults }}
        </div>

        <slot name="pagination" :pagination="pagination" :metadata="metadata">
            <div class="pagination-and-filters">

                <div class="pagination" v-if="pagination" v-cloak>

                    <pagination  :pagination="pagination" type="next-prev" @pageChange="pageChange"></pagination>

                    <div class="pagination-info">
                        <div class="text">Pagina {{ formatNumber(pagination.currentPage) }} van {{ formatNumber(pagination.totalPages) }}</div>
                    </div>

                    <input type="number" class="form-control short num-results" v-model="numResults" @change="setNumResults">

                    <div class="pagination-info">
                        <div class="text">van {{ formatNumber(metadata.totalRecords) }} in totaal</div>
                    </div>

                </div>

            </div>
        </slot>

        <div style="display:none;">
            <slot></slot>
        </div>


    </div>
</template>

<script>


    import Column from '../classes/Column';
    import expiringStorage from '../expiring-storage';
    import Row from '../classes/Row';
    import TableColumnHeader from './TableColumnHeader';
    import TableRow from './TableRow';
    import settings from '../settings';
    import isArray from 'lodash/isArray';
    import pick from 'lodash/pick';
    import Pagination from './Pagination';
    import { classList } from '../helpers';

    import TableColumnFilter from './TableColumnFilter';

    import activeToggle from './activeToggle';

    export default {
        components: {
            TableColumnHeader,
            TableRow,
            Pagination,
            TableColumnFilter,

            activeToggle,
        },

        props: {
            uniqueRowKey: {
                default: 'id',
            },
            dataNumResults: {
                default: 25,
            },
            dataFilters: { default: () => [], type: [Array] },
            data: { default: () => [], type: [Array, Function] },

            showFilter: { default: true },
            showCaption: { default: true },
            tooltipField: { default: null },
            rowClass: { default: () => [], type: Function },

            sortBy: { default: '', type: String },
            sortOrder: { default: '', type: String },

            cacheKey: { default: null },
            cacheLifetime: { default: 60 },

            tableClass: { default: settings.tableClass },
            theadClass: { default: settings.theadClass },
            tbodyClass: { default: settings.tbodyClass },
            filterInputClass: { default: settings.filterInputClass },
            filterPlaceholder: { default: settings.filterPlaceholder },
            filterNoResults: { default: settings.filterNoResults },
        },

        data: () => ({
            loading: false,
            columns: [],
            rows: [],
            filter: '',
            filters: [],
            sort: {
                fieldName: '',
                order: '',
            },
            numResults: 0,
            pagination: null,
            metadata: {},

            localSettings: {},
        }),

        async mounted() {

            this.sort.fieldName = this.sortBy;
            this.sort.order = this.sortOrder;
            this.numResults = this.dataNumResults;
            // console.log('zet numresults op ' + this.dataNumResults);

            this.restoreState();

            this.setInitialFilters();

            const columnComponents = this.$slots.default
                .filter(column => column.componentInstance)
                .map(column => column.componentInstance);

            this.columns = columnComponents.map(
                column => new Column(column)
            );

            columnComponents.forEach(columnCom => {
                Object.keys(columnCom.$options.props).forEach(
                    prop => columnCom.$watch(prop, () => {
                        this.columns = columnComponents.map(
                            column => new Column(column)
                        );
                    })
                );
            });

            await this.mapDataToRows();
        },

        watch: {

            filter() {
                if (!this.usesLocalData) {
                    this.mapDataToRows();
                }

                this.saveState();
            },

            data() {
                if (this.usesLocalData) {
                    this.mapDataToRows();
                }
            },
        },

        computed: {
            fullTableClass() {
                return classList('table-component__table', this.tableClass);
            },

            fullTableHeadClass() {
                return classList('table-component__table__head', this.theadClass);
            },

            fullTableBodyClass() {
                return classList('table-component__table__body', this.tbodyClass);
            },

            fullFilterInputClass() {
                return classList('table-component__filter__field', this.filterInputClass);
            },

            ariaCaption() {
                if (this.sort.fieldName === '') {
                    return 'Table not sorted';
                }

                return `Table sorted by ${this.sort.fieldName} ` +
                    (this.sort.order === 'asc' ? '(ascending)' : '(descending)');
            },

            usesLocalData() {
                return isArray(this.data);
            },

            displayedRows() {
                if (!this.usesLocalData) {
                    return this.sortedRows;
                }

                if (!this.showFilter) {
                    return this.sortedRows;
                }

                if (!this.columns.filter(column => column.isFilterable()).length) {
                    return this.sortedRows;
                }

                return this.sortedRows.filter(row => row.passesFilter(this.filter));
            },

            sortedRows() {
                if (!this.usesLocalData) {
                    return this.rows;
                }

                if (this.sort.fieldName === '') {
                    return this.rows;
                }

                if (this.columns.length === 0) {
                    return this.rows;
                }

                const sortColumn = this.getColumn(this.sort.fieldName);

                if (!sortColumn) {
                    return this.rows;
                }

                return this.rows.sort(sortColumn.getSortPredicate(this.sort.order, this.columns));
            },

            filterableColumnExists() {
                return this.columns.filter(c => c.isFilterable()).length > 0;
            },

            storageKey() {
                return this.cacheKey
                    ? `vue-table-component.${this.cacheKey}`
                    : `vue-table-component.${window.location.host}${window.location.pathname}${this.cacheKey}`;
            },

            showClearFilter(){
                return (this.filters.length + this.dataFilters.length) > 0
            }

        },

        methods: {

            async pageChange(page) {

                if (this.pagination) {
                    this.$set(this.pagination, 'currentPage', page);
                }
                await this.mapDataToRows();

                this.saveState()
            },

            rowClick(row){
                this.$emit('row-click', row)
            },
            rowOver(row){
                this.$emit('row-over', row)
            },
            rowOut(row){
                this.$emit('row-out', row)
            },

            async mapDataToRows() {
                const data = this.usesLocalData
                    ? this.prepareLocalData()
                    : await this.fetchServerData();

                const rowId = 0;

                this.rows = data
                    .map(rowData => {
                        rowData.vueTableComponentInternalRowId = rowData[this.uniqueRowKey];
                        return rowData;
                    })
                    .map(rowData => new Row(rowData, this.columns));

                this.$emit('change', this.filters)
            },

            prepareLocalData() {
                this.pagination = null;

                return this.data;
            },

            async fetchServerData() {

                this.loading = true;
                const page = this.pagination && this.pagination.currentPage || 1;

                const response = await this.data({
                    filter: this.filter,
                    filters: this.filters,
                    sort: this.sort,
                    numResults: this.numResults,
                    page: page,
                });

                this.metadata = response.metadata;
                this.pagination = response.pagination;

                this.loading = false;
                return response.data;
            },

            async refresh() {
                await this.mapDataToRows();
            },

            changeSorting(column) {
                const currentlySortedBy = column.sortBy || column.show;

                if (this.sort.fieldName !== currentlySortedBy) {
                    this.sort.fieldName = currentlySortedBy;
                    this.sort.order = 'asc';
                } else {
                    this.sort.order = (this.sort.order === 'asc' ? 'desc' : 'asc');
                }

                if (!this.usesLocalData) {
                    this.mapDataToRows();
                }

                this.saveState();
            },

            getColumn(columnName) {
                return this.columns.find(column => column.show === columnName);
            },

            saveState() {
                let storeData = pick(this.$data, ['filter', 'filters', 'sort'])
                storeData.currentPage = this.pagination.currentPage
                expiringStorage.set(this.storageKey, storeData, this.cacheLifetime);
            },

            restoreState() {
                const previousState = expiringStorage.get(this.storageKey);

                if (previousState === null) {
                    return;
                }

                this.sort = previousState.sort;
                this.filter = previousState.filter;
                this.applyFilters(previousState.filters);

                if(!this.pagination) {
                    this.pagination = {currentPage: 1, totalPages: 1}
                    this.metadata = {totalRecords: 1}
                }
                this.$set(this.pagination, 'currentPage', previousState.currentPage)

                this.saveState();
            },

            applyFilters(filters) {
                filters.map(prevFilter => {
                    this.filters.push({ column: prevFilter.column, value: prevFilter.value });
                    this.$slots.filters.map(filter => {
                        if (filter.componentInstance !== undefined && filter.componentInstance.column == prevFilter.column) {
                            filter.componentInstance.value = prevFilter.value;
                        }
                    });
                });
            },

            setFilter(column, value) {

                const index = this.filters.find(item => item['column'] == column);

                if (value === '') {
                    this.filters.splice(this.filters.indexOf(index), 1);
                } else {
                    if (index == undefined) {
                        this.filters.push({ column: column, value: value });
                    } else {
                        this.filters[this.filters.indexOf(index)].value = value;
                    }
                }

                this.pageChange(1);

                if (!this.usesLocalData) {
                    // this.mapDataToRows();
                }

                this.saveState();
            },

            clearFilters() {

                this.$slots.filters.map(filter => {
                    if (filter.tag !== undefined) {
                        const itemToRemove = this.filters.find(item => item['column'] == filter.componentInstance.column);
                        this.filters.splice(this.filters.indexOf(itemToRemove), 1);

                        filter.componentInstance.reset();
                    }
                });

                this.pageChange(1);

                if (!this.usesLocalData) {
                    this.mapDataToRows();
                }

                this.saveState();
            },

            setNumResults() {
                if (!this.usesLocalData) {
                    this.pageChange(1);

                    if (!this.usesLocalData) {
                        this.mapDataToRows();
                    }
                }
            },

            setInitialFilters() {
                if (this.dataFilters == []) return;
                if (this.filters.length > 0) return;

                this.applyFilters(this.dataFilters);
            },

            removeRow(id) {
                const itemToRemove = this.rows.find(item => item.data.id == id);
                if (itemToRemove !== undefined) {
                    this.rows.splice(this.rows.indexOf(itemToRemove), 1);
                    this.metadata.totalRecords--;
                }
            },

            formatNumber(number) {
                if(!number) return

                return number.toLocaleString('nl-NL', {
                    minimumFractionDigits : 0,
                    maximumFractionDigits : 2,
                });
            },

            getRows(){
                return this.rows
            }
        },
    };
</script>
