import React, { useState } from 'react';
import axios from 'axios';
import './App.css';


const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// OpenWeatherMap API 키
const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';

// 날씨 정보를 가져오는 함수
async function getWeather(city) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
    const { main } = response.data.weather[0];
    return main;
  } catch (error) {
    console.error('날씨 정보를 가져오지 못했습니다.', error);
    return '';
  }
}

// 옷 추천 로직 구현
function recommendClothes(weather) {
  // 날씨 정보를 기반으로 옷 추천 로직을 구현.
  // 여러 가지 조건에 따라 다른 옷을 추천할 수 있음
  
  if (weather === 'Clear') {
    return [
      { name: '반팔 티셔츠', image: 'tshirt.jpg' },
      { name: '반바지', image: 'shorts.jpg' },
      { name: '모자', image: 'hat.jpg' },
    ];
  } else if (weather === 'Rain') {
    return [
      { name: '비올 때 착용할 재킷', image: 'jacket.jpg' },
      { name: '우비', image: 'raincoat.jpg' },
      { name: '장화', image: 'boots.jpg' },
    ];
  } else {
    return [
      { name: '일반 셔츠', image: 'shirt.jpg' },
      { name: '청바지', image: 'jeans.jpg' },
      { name: '운동화', image: 'sneakers.jpg' },
    ];
  }
}

// API 엔드포인트
app.post('/recommendations', async (req, res) => {
  const { city } = req.body; // 클라이언트가 전송한 도시 정보를 가져옴

  // 날씨 정보를 가져옴
  const weather = await getWeather(city);

  // 추천 로직을 실행하여 추천 결과를 얻음
  const recommendations = recommendClothes(weather);

  // 추천 결과를 클라이언트에 응답으로 보냄
  res.json(recommendations);
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [city, setCity] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleRecommendations = async () => {
    try {
      const response = await axios.post('/recommendations', { city });
      setRecommendations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>옷 추천 사이트</h1>
      <input type="text" value={city} onChange={handleCityChange} placeholder="도시를 입력하세요" />
      <button onClick={handleRecommendations}>추천 받기</button>
      <div>
        {recommendations.map((item, index) => (
          <div key={index}>
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
