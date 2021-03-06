import React from "react";
import "./InsideApp.css";
import { Route, Switch } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import GovBar from "./bar/GovBar.jsx";
import Menu from "./bar/Menu.jsx";
import Footer from "./bar/Footer.jsx";
import PageHome from "./PageHome.jsx";
import PageDashboard from "./PageDashboard.jsx";
import PagePrivateSector from "./PagePrivateSector.jsx";
import PageMap from "./PageMap.jsx";
import PageCompany from "./PageCompany.jsx";
import PagePublic from "./PagePublic.jsx";
import PageCivilSociety from "./PageCivilSociety.jsx";
import { getRequest } from "../utils/request.jsx";
import getMailerliteFunction from "../utils/mailerlite.jsx";

export default class InsideApp extends React.Component {
	constructor(props) {
		super(props);

		this.changeState = this.changeState.bind(this);

		this.state = {
			taxonomy: null,
			logged: false,
			email: null,
			ml_account: getMailerliteFunction(),
		};
	}

	componentDidMount() {
		getRequest.call(this, "public/get_public_taxonomy", (data) => {
			this.setState({
				taxonomy: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="InsideApp">
				<GovBar/>
				<Route
					render={(props) => <Menu
						logged={this.state.logged}
						email={this.state.email}
						ml_account={this.state.ml_account}
						{...props}
					/>}
				/>
				<div id="InsideApp-content">
					<Switch>
						<Route
							path="/company/:id"
							render={(props) => <PageCompany {...props} taxonomy={this.state.taxonomy} />}
						/>
						<Route
							path="/privatesector"
							render={(props) => <PagePrivateSector {...props} taxonomy={this.state.taxonomy} />}
						/>
						<Route
							path="/publicsector"
							render={(props) => <PagePublic {...props} taxonomy={this.state.taxonomy} />}
						/>
						<Route
							path="/civilsociety"
							render={(props) => <PageCivilSociety {...props} taxonomy={this.state.taxonomy} />}
						/>
						<Route
							path="/dashboard"
							render={(props) => <PageDashboard {...props} taxonomy={this.state.taxonomy} />}
						/>
						<Route
							path="/map"
							render={(props) => <PageMap {...props} taxonomy={this.state.taxonomy}/>}
						/>

						<Route path="/" render={(props) => <PageHome {...props} />}/>
					</Switch>
				</div>
				<Footer/>
			</div>
		);
	}
}
