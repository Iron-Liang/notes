function compile(template) {
    let evalExpr = /<%=(.+?)%>/g
    let expr = /<%([\s\S]+?)%>/g
    template = template
        .replace(evalExpr, '`); \n echo( $1 ); \n echo(`')
        .replace(expr, '`); \n $1 \n echo(`')

    template = 'echo(`' + template + '`)'

    let scripts = 
    `let output = ""
    function echo(html) {
        output += html
    }

    ${template}

    return output`

    return new Function('data', scripts)
}

let template = `
<ul>
    <% for(let i=0; i < data.supplies.length; i++) { %>
        <li><%= data.supplies[i] %></li>
    <% } %>
</ul>
`

let parse = compile(template)

console.log(parse({ supplies: ["node", "native", "browser"]}))