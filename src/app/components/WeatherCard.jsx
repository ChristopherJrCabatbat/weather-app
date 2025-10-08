export default function WeatherCard({ data }) {
  // safe accessors
  const name = data?.name;
  const country = data?.sys?.country;
  const weather = data?.weather?.[0];
  const temp = data?.main?.temp;
  const feels = data?.main?.feels_like;
  const humidity = data?.main?.humidity;
  const wind = data?.wind?.speed;

  // OpenWeather icon pattern:
  // [https://openweathermap.org/img/wn/{icon}@2x.png](https://openweathermap.org/img/wn/{icon}@2x.png)
  const iconUrl = weather?.icon
    ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
    : null;

  return (
    <div className="card">
      {" "}
      <div className="cardHeader">
        {" "}
        <h2>
          {name}
          {country ? `, ${country}` : ""}
        </h2>{" "}
        <p className="desc">{weather?.description}</p>{" "}
      </div>
      <div className="cardMain">
        {iconUrl && (
          <img src={iconUrl} alt={weather?.description} className="icon" />
        )}
        <div className="temps">
          <p className="temp">
            {temp !== undefined ? Math.round(temp) : "--"}°C
          </p>
          <p className="feels">
            Feels like: {feels !== undefined ? Math.round(feels) : "--"}°C
          </p>
        </div>
      </div>
      <div className="cardFooter">
        <p>Humidity: {humidity ?? "--"}%</p>
        <p>Wind: {wind ?? "--"} m/s</p>
      </div>
    </div>
  );
}
