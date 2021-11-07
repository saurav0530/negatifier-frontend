import './App.css';
import Home from './components/home'
import Transcript from './components/transcript'
import LogoImage from './logo.jpg';
import {Navbar,Container,Tab,Tabs} from 'react-bootstrap'

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
				<Navbar bg="success" variant="dark" fixed='top'>
					<Container className="justify-content-center"><Navbar.Brand href="#home" ><center>PROJECTS_1901EE54</center></Navbar.Brand></Container>
				</Navbar>
				<Container style={{width:'100vw',marginTop:'70pt'}}>
					<Tabs defaultActiveKey="home" id="uncontrolled-tab-example" className="mb-3">
						<Tab eventKey="home" title="Negatifier" >
							<Home></Home>
						</Tab>
						<Tab eventKey="profile" title="Transcripts">
							<Transcript></Transcript>
						</Tab>
					</Tabs>
				</Container>
			</header>
		</div>
	);
}

export default App;
