
import { Component, OnInit } from "@angular/core";

 import { HttpClient } from "@angular/common/http";
 import * as Highcharts from 'highcharts';


// // import * as Highcharts from "highcharts";

import * as moment from "moment";

@Component({
  selector: 'app-covid-data',
  templateUrl: './covid-data.component.html',
  styleUrls: ['./covid-data.component.css']
})



export class CovidDataComponent implements OnInit {
  showButtons:boolean=true;
  covidType:any=['Global','India'];
  showTable=true;
  isLoading=true;
  sno:number;
  newCovidData:any;
  nRows=10;
  numberOfRows=[10,15,30,50,90];
  n:number;
  filterData:any=[];
  pageNumber=1;
  updateFlag = false;
  covidData = [];

  Highcharts = Highcharts;
  linechart = {
    title: {
      text: "Covid-19 in India",
    },

    credits: {
      enabled: false,
    },
    subtitle: {
      text: "",
    },

    yAxis: {
      title: {
        text: "Number",
      },
    },

    xAxis: {
      categories: [],
    },

    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
    },

    plotOptions: {},
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
    series: [],
    chart: {
      type: "line",
    }
  };

  chart: any;

 constructor(private http:HttpClient) {}

  ngOnInit() {
    this.getData('u');
  }

  parseInt(value){
    return parseInt(value)
  }

  changePage(u:string,v:number){
    v = Number(v);
    this.filterData=[];
    if(u==='next'){
    this.pageNumber=this.pageNumber+1;
    }else if(u==='previous'){
      this.pageNumber=this.pageNumber-1;
    }
    else {
      this.pageNumber=1;
    }
    let x= v*(this.pageNumber-1);
    for(let j=x; j<v+x; j++){
      this.filterData.push(this.covidData[j]);
    }
      }


      clickFunction(u:string){
        if(u=='showTable'){
          return this.showTable
        }else{
          this.showTable=false;
        }

      }


      getData(u:string){
        this.isLoading=true;

        if(u=='India'){
          this.http
          .get(
            "https://api.apify.com/v2/datasets/58a4VXwBBF0HtxuQa/items?format=json&clean=1"
          )
          .subscribe((responseData) => {

            let series = [
              {
                name:"Total Cases",
                data:[],
                color:'black'
              },

              {
                name:"Active Cases",
                data:[],
                color:'blue'
              },
              {
                name:"Deaths",
                data:[],
                color:'red'
              },
              {
                name:"Recovered",
                data:[],
                color:'green'
              }
            ];

            let xCategories= [];
            this.covidData = JSON.parse(JSON.stringify(responseData));
            for (let i = 0; i < this.covidData.length; i++) {
              this.covidData[i]["date"] = moment(
                this.covidData[i].lastUpdatedAtApify
              )
                .add(330, "minutes")
                .format("DD-MM-YYYY hh:mm:ss A");
                this.covidData[i]["sno"]=i+1;
              this.covidData[i]["recoveredPercent"] = Number(
                (this.covidData[i].recovered / this.covidData[i].totalCases) * 100
              ).toFixed(2);


              series[0].data.push(Number(this.covidData[i].totalCases));
              series[1].data.push(Number(this.covidData[i].activeCases));
              series[2].data.push(Number(this.covidData[i].deaths));
              series[3].data.push(Number(this.covidData[i].recovered));
              xCategories.push(this.covidData[i].date);
            }
            this.changePage('first',this.nRows);
            const self = this,
            chart = this.chart;
            this.linechart.title.text= "Covid-19 in India";
            self.linechart.series =series;
          self.linechart.xAxis.categories=xCategories;

            let newCovidData = this.covidData.map(function (x) {
              var o = Object.assign(
                {
                  date: moment(x.lastUpdatedAtApify).format("DD-MM-YYYY HH:mm:ss"),
                  recoveredPercent: Number(
                    (x.recovered / x.totalCases) * 100
                  ).toFixed(2),
                },
                x
              );
              o.isActive = true;
              return o;
            });
            this.isLoading = false;
          });

        }else{

          this.http.get('https://covid2019-api.herokuapp.com/v2/timeseries/global')
          .subscribe((responseData)=>{

            let series = [
              {
                name:"Total Cases",
                data:[],
                color:'black'
              },

              {
                name:"Active Cases",
                data:[],
                color:'blue'
              },
              {
                name:"Deaths",
                data:[],
                color:'red'
              },
              {
                name:"Recovered",
                data:[],
                color:'green'
              }
            ]

            console.log(responseData);
            this.covidData=responseData["data"];


            let xCategories1= [];
            for(let i=0; i<this.covidData.length; i++){

              this.covidData[i]["totalCases"]=this.covidData[i][Object.keys(responseData["data"][i])[0]]["confirmed"];
              this.covidData[i]["activeCases"]=this.covidData[i][Object.keys(responseData["data"][i])[0]]["confirmed"]
                                              -this.covidData[i][Object.keys(responseData["data"][i])[0]]["recovered"]
                                              -this.covidData[i][Object.keys(responseData["data"][i])[0]]["deaths"];
              this.covidData[i]["deaths"]=this.covidData[i][Object.keys(responseData["data"][i])[0]]["deaths"];

              this.covidData[i]["recovered"]=this.covidData[i][Object.keys(responseData["data"][i])[0]]["recovered"];
              this.covidData[i]["lastUpdatedAtApify"]=Object.keys(responseData["data"][i])[0];


              this.covidData[i]["sno"]=i+1;
              this.covidData[i]["recoveredPercent"] = Number(
                (this.covidData[i].recovered / this.covidData[i].totalCases) * 100
              ).toFixed(2);

            series[0].data.push(Number(this.covidData[i].totalCases));

            series[1].data.push(Number(this.covidData[i][Object.keys(responseData["data"][i])[0]]["confirmed"]
            -this.covidData[i][Object.keys(responseData["data"][i])[0]]["recovered"]
            -this.covidData[i][Object.keys(responseData["data"][i])[0]]["deaths"]));

            series[2].data.push(Number(this.covidData[i].deaths));
            series[3].data.push(Number(this.covidData[i].recovered));
            xCategories1.push(this.covidData[i].lastUpdatedAtApify);



            }

            this.linechart.series =series;
        this.linechart.xAxis.categories=xCategories1;
        this.linechart.title.text= "Covid-19 Globally";
        this.changePage('first',this.nRows);
        this.isLoading = false;

          });

        }

      }
      showButtonsFunction(){
        this.showButtons=true;
      }
    }


