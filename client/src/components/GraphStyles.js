export default [
    {
        selector: 'node',
        style: {
            'width': '200',
            'height': '200',
            'font-size': '18',
            'font-weight': 'bold',
            // 'content': `data(label)`,
            'text-valign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '140',
            'background-color': 'gold',
            'border-color': '#f5c2e7',
            'background-fit': "cover",
            'border-width': '3',
            'color': 'darkred',
            "background-image": "data(imageUrl)"
        }
    },
    {
        selector: 'node:selected',
        style: {
            'background-color': 'darkred',
            color: 'white',
            'border-color': 'darkred',
            'line-color': '#0e76ba',
            'target-arrow-color': '#0e76ba'
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'text-background-opacity': '1',
            'text-background-padding': '3',
            'width': '3',
            'target-arrow-shape': 'triangle',
            'line-color': 'rgb(166, 227, 161)',
            'target-arrow-color': 'rgb(166, 227, 161)',
            'arrow-scale': 4,
            'font-weight': 'bold'
        }
    },
    {
        selector: 'edge[label]',
        style: {
            'content': `data(label)`,
        }
    },
    {
        selector: 'edge.label',
        style: {
            'line-color': 'orange',
            'target-arrow-color': 'orange'
        }
    }
]

