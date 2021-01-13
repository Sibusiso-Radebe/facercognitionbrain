import React from 'react';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import './App.css';

const particlesOptions = {
	particles: {
		number: {
			value: 30,
			density: {
				enable: true,
				value_area: 300,
			},
		},
	},
};

const initialState = {
	input: '',
	imageUrl: '',
	box: {},
	route: 'SignIn',
	isSignedIn: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: 0,
		joined: '',
	},
};

class App extends React.Component {
	constructor() {
		super();
		this.state = initialState;
	}

	loadUser = (data) => {
		this.setState({
			user: {
				id: data.id,
				name: data.name,
				email: data.email,
				entries: data.entries,
				joined: data.joined,
			},
		});
	};

	calculateFaceLocation = (data) => {
		const clarifaiFace =
			data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputImage');
		const width = Number(image.width);
		const height = Number(image.height);

		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - clarifaiFace.right_col * width,
			bottomRow: height - clarifaiFace.bottom_row * height,
		};
	};
	displayFaceBox = (box) => {
		this.setState({ box: box });
	};

	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	};

	onButtonSubmit = () => {
		this.setState({ imageUrl: this.state.input });
		fetch('https://vast-caverns-04996.herokuapp.com/imageUrl', {
			method: 'post',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				input: this.state.input,
			}),
		})
			.then((response) => response.json())
			.then((response) => {
				if (response) {
					fetch('https://vast-caverns-04996.herokuapp.com/image', {
						method: 'put',
						headers: { 'Content-type': 'application/json' },
						body: JSON.stringify({
							id: this.state.user.id,
						}),
					})
						.then((response) => response.json())
						.then((count) => {
							this.setState(Object.assign(this.state.user, { entries: count }));
						})
						.catch(console.log);
				}
				this.displayFaceBox(this.calculateFaceLocation(response));
			})
			.catch((err) => console.log('error', err));
	};

	onRouteChange = (route) => {
		console.log('route= ', route);
		if (route === 'SignOut') {
			this.setState(initialState);
		} else if (route === 'home') {
			this.setState({ isSignedIn: true });
		}
		this.setState({ route: route });
	};
	render() {
		const { isSignedIn, imageUrl, route, box } = this.state;
		return (
			<div className="App">
				<Particles className="particles" params={particlesOptions} />
				<Navigation
					isSignedIn={isSignedIn}
					onRouteChange={this.onRouteChange}
				/>
				{route === 'home' ? (
					<React.Fragment>
						<Logo />
						<Rank
							name={this.state.user.name}
							entries={this.state.user.entries}
						/>
						<ImageLinkForm
							onInputChange={this.onInputChange}
							onButtonSubmit={this.onButtonSubmit}
						/>
						<FaceRecognition box={box} imageUrl={imageUrl} />
					</React.Fragment>
				) : route === 'SignIn' ? (
					<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
				) : (
					<Register
						onRouteChange={this.onRouteChange}
						loadUser={this.loadUser}
					/>
				)}
			</div>
		);
	}
}

export default App;
