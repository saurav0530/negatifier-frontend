import './App.css';
import Home from './components/home'
import LogoImage from './logo.jpg';

function App() {
  var sectionStyle = {
    backgroundImage: `url(${LogoImage})`,
    backgroundSize: 'cover',
    height:'100vh',
    display:'flex',
    // alignItems:'center',
    justifyContent:'center'
  }
  return (
    <div className="App" style={sectionStyle}>
      <header className="App-header" style={{display:'flex',flexDirection:'column'}}>
        <Home></Home>
      </header>
    </div>
  );
}

export default App;
