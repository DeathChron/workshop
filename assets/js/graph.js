const getDepth = ({ children }) => 1 +
    (children ? Math.max(...children.map(getDepth)) : 0)

function createGraph(graphName) {
    var svg = d3.select("#" + graphName + "-graph"),
        margin = 20,
        diameter = + 1000,
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


    var color = d3.scaleLinear()
        .domain([-1, 10])
        .range(["hsl(298, 52%, 24%)", "hsl(53, 53%, 60%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(3);


    d3.json("assets/json/" + graphName + ".json", function (error, root) {
        if (error) throw error;

        root = d3.hierarchy(root)
            .sum(function (d) { return 1; })
            .sort(function (a, b) { return b.value - a.value; });

        var focus = root,
            nodes = pack(root).descendants(),
            view;

        var clicked = false;
        var current = root;

        var circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function (d) {
                if (d.children) {
                    return color(d.depth)
                }
                if (d.data.type == "learning") {
                    return "#f4cccc"
                } else if (d.data.type == "video") {
                    return "#bca9f8"
                } else if (d.data.type == "laboratory") {
                    return "#bad08e"
                } else if (d.data.type == "wordlist") {
                    return "#ccdcf4"
                }
                return "#e8e2bb"
            })
            .on("click", function (d) {
                clicked = true;
                if (!d.data.children) {
                    if (d.parent == current) {
                        OpenDialog(d.data)
                    } else {
                        zoom(d.parent);
                    }
                } else if (focus !== d) {
                    zoom(d);
                    d3.event.stopPropagation();
                }
            });

        var text = g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .attr("stroke", "#000000")
            // .attr("stroke-width", "1")
            // .style("fill-opacity", function (d) { return d.parent === root ? 1 : 0; })
            .style("display", function (d) { return d.parent === root ? "inline" : "none"; })
            .text(function (d) { return d.data.name; });

        var node = g.selectAll("circle,text");

        svg.style("background", color(-1))
            .on("click", function () {
                if (clicked) {
                    clicked = false;
                } else {
                    zoom(root);
                }
            });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {

            current = d;

            var focus0 = focus; focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function (d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function (t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
                .duration(150)
                .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
                .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });

        }

        function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function (d) { return d.r * k; });
        }
    });
}