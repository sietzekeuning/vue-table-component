<script>
import TableColumnFilter from '../src/components/TableColumnFilter';
import TableComponent from '../src/components/TableComponent';
import TableColumn from '../src/components/TableColumn';

export default {
    components: {TableColumnFilter, TableComponent, TableColumn},
    created(){
        console.log('init')
    },

    methods: {
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        async fetchData(){
            await this.sleep(2000)

            return {
                data       : [
            { firstName: 'John', lastName: 'Lennon', instrument: 'Guitar', birthday: '04/10/1940', songs: 72 },
            { firstName: 'Paul', lastName: 'McCartney', instrument: 'Bass', birthday: '18/06/1942', songs: 70 },
            { firstName: 'George', lastName: 'Harrison', instrument: 'Guitar', birthday: '25/02/1943', songs: 22 },
            { firstName: 'Ringo', lastName: 'Starr', instrument: 'Drums', birthday: '07/07/1940', songs: 2 },
            { firstName: 'John', lastName: 'Lennon', instrument: 'Guitar', birthday: '04/10/1940', songs: 72 },
            { firstName: 'Paul', lastName: 'McCartney', instrument: 'Bass', birthday: '18/06/1942', songs: 70 },
            { firstName: 'George', lastName: 'Harrison', instrument: 'Guitar', birthday: '25/02/1943', songs: 22 },
            { firstName: 'Ringo', lastName: 'Starr', instrument: 'Drums', birthday: '07/07/1940', songs: 2 },
            { firstName: 'John', lastName: 'Lennon', instrument: 'Guitar', birthday: '04/10/1940', songs: 72 },
            { firstName: 'Paul', lastName: 'McCartney', instrument: 'Bass', birthday: '18/06/1942', songs: 70 },
            { firstName: 'George', lastName: 'Harrison', instrument: 'Guitar', birthday: '25/02/1943', songs: 22 },
            { firstName: 'Ringo', lastName: 'Starr', instrument: 'Drums', birthday: '07/07/1940', songs: 2 },
            { firstName: 'John', lastName: 'Lennon', instrument: 'Guitar', birthday: '04/10/1940', songs: 72 },
            ],
                pagination : {
                    currentPage : 1,
                    totalPages  : 2
                },
                metadata : {
                    to             : 1,
                    from           : 25,
                    totalRecords   : 41,
                    recordsPerPage : 25
                }
            }
        },

        rowClass(rowData){
            return ['enabled', rowData.lastName]
        }
    }
}
</script>