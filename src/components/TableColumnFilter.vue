<template>
    <td v-if="!hidden" 
        :style="{ minWidth: minWidth ? minWidth + 'px' : '', maxWidth: maxWidth ? maxWidth + 'px' : '' }">
        <slot>
            <select v-if="type == 'select'"
                @change="filter"
                v-model="value"
                class="form-control"
                :placeholder="placeholder || ''"
            >
                <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>

            <input v-if="type == 'date'" 
                type="date" 
                @change="filter"
                v-model="value"
                class="form-control"
                :placeholder="placeholder || ''"
            >

            <input v-if="type == 'text'" 
                type="text" 
                @input="debounceFilter"
                v-model="value"
                class="form-control"
                :placeholder="placeholder || ''"
            >
        </slot>
    </td>
</template>

<script>
    var debounce = require('debounce');

    export default {
        props: {
            column: {},
            minWidth: {},
            maxWidth: {},
            placeholder: {},
            type: {
                default: 'text',
            },
            options: {
                default: () => {
                    return [];
                },
            },
            hidden: { default: false, type: Boolean },
            initValue: ''
        },

        data() {
            return {
                value : this.initValue,
            };
        },

        methods: {
            
            reset() {
                this.value = '';
            },

            filter() {
                this.$parent.setFilter(this.column, this.value);
            },

            debounceFilter: debounce(function(e){
                console.log(e);
                this.value = e.target.value;
                this.filter();
            }, 400)
            
        },

    };
</script>