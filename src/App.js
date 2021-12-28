import React, { Component } from 'react';
import './App.css';
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import locations from './locations';

class App extends Component {
  componentDidMount() {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    const root = am5.Root.new("chartdiv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create json file to download
    const handleSaveToPC = jsonData => {
      const fileData = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([fileData], {type: "text/plain"});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'results.json';
      link.href = url;
      link.click();
    }

    // Filter data from locations.json
    const getData = () => {
      let newData = []

      locations.locations.forEach(item => {
        const i = locations.reachedLocations.findIndex(el => { return el.name === item.name })
        if(i !== -1)
        {
          let tmp1 = []
          item.countries.forEach(item => {
            const j = locations.reachedLocations[i].countries.findIndex(el => { return el.name === item.name })
            if(j !== -1){
              let tmp2 = []
              item.cities.forEach(item => {
                const k = locations.reachedLocations[i].countries[j].cities.findIndex(el => { return el.name === item.name })
                if(k === -1)
                {
                  tmp2.push(item)
                }
              })
              if (tmp2.length !== 0)
                tmp1.push({name: item.name, cities: tmp2})
            }
            else
            {
              tmp1.push(item)
            }
          })
          if (tmp1.length !== 0)
            newData.push({name: item.name, countries: tmp1})
        }
        else
        {
          newData.push(item)
        }
      })
      handleSaveToPC({locations: newData})
      return {locations: newData}
    }

    // Create wrapper container
    let container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/hierarchy/#Adding
    let series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        initialDepth: 3,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        centerStrength: 0.5,
        minRadius: 20,
        maxRadius: am5.percent(15)
      })
    );

    // Generate and set data
    // https://www.amcharts.com/docs/v5/charts/hierarchy/#Setting_data
    let data = {
      name: "Locations",
      children: getData().locations.map(item => {
        return({
          name: item.name,
          children: item.countries.map(item => {
            return({
              name: item.name,
              children: item.cities.map(item => {
                return({
                  name: item.name,
                  value: 1
                })
              })
            })
          })
        })
      })
    }

    series.data.setAll([data]);
    series.set("selectedDataItem", series.dataItems[0]);
    
    // Make stuff animate on load
    series.appear(1000, 100);

    this.root = root;
  }

  componentWillUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  }

  render() {
    return (
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    );
  }
}

export default App;
