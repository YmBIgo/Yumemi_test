import React, {useState, useEffect} from 'react';
import axios from "axios"

import {Line} from "react-chartjs-2"
import {Chart, registerables} from "chart.js"
import './App.css';

Chart.register(...registerables)

function App() {

  type CHART_DATA = {
    label: string
    data: number[]
    borderColor: string
  }

  const [prefectures, set_prefectures] = useState<(number|string)[][]>([])
  const [prefecture_chart_data, set_prefecture_chart_data] = useState<CHART_DATA[]>([])

  const prefectures_years_labels = ["1980", "1990", "2000", "2010", "2020"]
  const prefecture_chart = {
    labels: prefectures_years_labels,
    datasets: prefecture_chart_data
  }
  const options: {} = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x:
        {
          display: true,
          ticks: {
            stepSize: 10,
          }
        }
      ,
      y:
        {
          ticks: {
            stepSize: 1000000
          },
          display: true,
          suggestedMin: 1000000,
          suggestedMax: 8000000,
          beginAtZero: true,
          scaleLabel: {
            display: true,
            labelString: "人口数"
          }
        }
      ,
    },
    plugins: {
      legend: {
        display: true,
        position: "right"
      }
    }
  }

  useEffect(() => {
    getPrefectures()
  }, [])

  const getPrefectures = () => {
    const resas_url = "https://opendata.resas-portal.go.jp/api/v1/prefectures"
    const prefercture_json = axios.get(
      resas_url,
      {
        headers: {'X-API-KEY': 'YOUR-API-KEY'}
      }
    )
    type PREF_JSON_TYPE = { prefCode: string, prefName: string }
    prefercture_json.then((json_result) => {
      const pref_result = json_result.data.result.map((pref: PREF_JSON_TYPE) => {
        return [pref.prefCode, pref.prefName]
      })
      set_prefectures(pref_result)
    })
  }

  const getPrefectureStatistic = (pref_id: number | string) => {
    const registered_prefectures: string[] = prefecture_chart_data.map((p_c_data: CHART_DATA) => {
      return p_c_data.label
    })
    const prefecture_name: string = prefectures[Number(pref_id)-1][1] as string
    if (registered_prefectures.includes(prefecture_name)) {
      set_prefecture_chart_data((prefecture_chart_data) => {
        const p_chart_data = prefecture_chart_data.filter((p_c_data) => {
          return p_c_data.label != prefecture_name
        })
        return p_chart_data
      })
      return
    }
    const resas_url = "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?prefCode=" + pref_id
    const statistic_json = axios.get(
      resas_url,
      {
        headers: {'X-API-KEY': 'YOUR-API-KEY'}
      }
    )
    type PREF_STATISTIC_DATA = {
      year: number;
      value: number
    }
    statistic_json.then((json_result) => {
      let pref_statistic_data = json_result.data.result.data[0].data
      pref_statistic_data = pref_statistic_data.map((p_s_data: PREF_STATISTIC_DATA) => {
        if (p_s_data.year >= 1980 && p_s_data.year <= 2020) {
          return p_s_data.value
        }
        return 0
      })
      pref_statistic_data = pref_statistic_data.filter((p_s_data: number) => {
        return p_s_data != 0
      })
      const pref_color1 = Math.floor(Math.random() * 255)
      const pref_color2 = Math.floor(Math.random() * 255)
      const pref_color3 = Math.floor(Math.random() * 255)
      console.log(pref_color1, pref_color2, pref_color3)
      const pref_color = "rgb(" + pref_color1.toString() + ", "
                        + pref_color2.toString() + ", "
                        + pref_color3.toString() + ")"
      const pref_statistic_data_result: CHART_DATA = {
        label: prefecture_name,
        data: pref_statistic_data,
        borderColor: pref_color
      }
      set_prefecture_chart_data((prefecture_chart_data) => {
        prefecture_chart_data = [...prefecture_chart_data, pref_statistic_data_result]
        return prefecture_chart_data
      })
    })
  }

  return (
    <div className="App">
      <div className="app-title">
        <h1>Title</h1>
      </div>
      <h2 className="app-title-text">都道府県</h2>
      {prefectures.map((pref) => {
        return(
          <div className="pref-checkbox-area">
            <input
              type="checkbox"
              className="pref-checkbox"
              value={pref[0]}
              onChange={() => getPrefectureStatistic(pref[0])}
            />
            <span>{pref[1]}</span>
          </div>
        )
      })}
      <div
        className="chart-line-area"
      >
        <Line
          height={500}
          width={500}
          data={prefecture_chart}
          options={options}
          id="chart-key"
        />
      </div>
    </div>
  );
}

export default App;
