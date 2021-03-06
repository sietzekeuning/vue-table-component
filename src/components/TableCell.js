export default {
    functional: true,

    props: ['column', 'row'],

    render(createElement, { props }) {
        const data = {};

        if (props.column.cellClass) {
            data.class = props.column.cellClass;
        }
        
        if(props.row.data[props.column.show] == null) {
            props.row.data[props.column.show] = '';
        }

        if (props.column.template) {
            return createElement('td', data, props.column.template(props.row.data));
        }

        data.domProps = {};
        data.domProps.innerHTML = props.column.formatter(props.row.getValue(props.column.show), props.row.data);
        data.style = {display: props.column.hidden ? 'none' : ''}

        return createElement('td', data);
    },
};
