import React from "react";
import "./PagePrivateSector.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import Company from "./item/Company.jsx";
import SimpleTable from "./table/SimpleTable.jsx";
import PrivateSectorSearch from "./form/PrivateSectorSearch.jsx";
import BarWorkforceRange from "./chart/BarWorkforceRange.jsx";
import BarActorAge from "./chart/BarActorAge.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import VennActorDistribution from "./chart/VennActorDistribution.jsx";
import { getMainAppURL, getPrivateSpaceURL } from "../utils/env.jsx";

export default class PagePrivateSector extends React.Component {
	constructor(props) {
		super(props);

		this.getCompanies = this.getCompanies.bind(this);
		this.getPCDoctors = this.getPCDoctors.bind(this);
		this.getCoreStartups = this.getCoreStartups.bind(this);
		this.getAnalytics = this.getAnalytics.bind(this);
		this.getTotalEmployees = this.getTotalEmployees.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.modifyFilters = this.modifyFilters.bind(this);

		this.state = {
			actors: null,
			pcDoctors: null,
			coreStartups: null,
			analytics: null,
			filters: {
				name: getUrlParameter("name"),
				taxonomy_values: getUrlParameter("taxonomy_values") !== null
					? getUrlParameter("taxonomy_values").split(",").map((v) => parseInt(v, 10)) : [],
				corebusiness_only: getUrlParameter("corebusiness_only") === "true" ? true : null,
				startup_only: getUrlParameter("startup_only") === "true" ? true : null,
			},
		};
	}

	componentDidMount() {
		this.getCompanies();
		this.getAnalytics();
	}

	getCompanies() {
		this.setState({
			actors: null,
		}, () => {
			getRequest.call(this, "public/get_public_companies?ecosystem_role=ACTOR&entity_type=PRIVATE%20SECTOR&"
				+ dictToURI(this.state.filters), (data) => {
				this.setState({
					actors: data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getPCDoctors() {
		if (this.state.analytics) {
			this.setState({
				pcDoctors: null,
			}, () => {
				const individualValues = this.state.analytics.taxonomy_values
					.filter((v) => v.category === "ENTITY TARGET" && v.name === "INDIVIDUAL");

				if (individualValues.length === 1) {
					getRequest.call(this, "public/get_public_companies?"
						+ "ecosystem_role=ACTOR&entity_type=PRIVATE%20SECTOR"
						+ "&taxonomy_values=" + individualValues[0].id, (data) => {
						this.setState({
							pcDoctors: data,
						});
					}, (response) => {
						nm.warning(response.statusText);
					}, (error) => {
						nm.error(error.message);
					});
				}
			});
		}
	}

	getCoreStartups() {
		if (this.state.analytics) {
			this.setState({
				coreStartups: null,
			}, () => {
				getRequest.call(this, "public/get_public_companies?"
					+ "ecosystem_role=ACTOR&entity_type=PRIVATE%20SECTOR"
					+ "&corebusiness_only=true&startup_only=true",
				(data) => {
					this.setState({
						coreStartups: data,
					});
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			});
		}
	}

	getAnalytics() {
		getRequest.call(this, "public/get_public_analytics", (data) => {
			this.setState({
				analytics: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onSearch() {
		// eslint-disable-next-line no-restricted-globals
		history.replaceState(null, null, "?" + dictToURI(this.state.filters));

		this.getCompanies();
	}

	modifyFilters(field, value) {
		const filters = { ...this.state.filters };
		filters[field] = value;
		this.setState({ filters });
	}

	getTotalEmployees() {
		if (this.state.actors === null) return 0;

		let total = 0;
		const acceptedIDs = this.state.actors.map((a) => a.id);

		for (let i = 0; i < this.state.analytics.workforces.length; i++) {
			if (acceptedIDs.indexOf(this.state.analytics.workforces[i].company) >= 0) {
				total += this.state.analytics.workforces[i].workforce;
			}
		}

		return total;
	}

	render() {
		return (
			<div className={"PagePrivateSector page max-sized-page"}>
				<div className="row">
					<div className="col-md-12">
						<Breadcrumb>
							<Breadcrumb.Item href={getMainAppURL()}>
								CYBERSECURITY LUXEMBOURG
							</Breadcrumb.Item>
							<Breadcrumb.Item><Link to="/">ECOSYSTEM</Link></Breadcrumb.Item>
							<Breadcrumb.Item><Link to="/privatesector">PRIVATE SECTOR</Link></Breadcrumb.Item>
						</Breadcrumb>
					</div>
				</div>

				<PrivateSectorSearch
					analytics={this.state.analytics}
					filters={this.state.filters}
					onChange={this.modifyFilters}
					onSearch={this.onSearch}
				/>

				<div className="row">
					<div className="col-md-12">
						<h3>{this.state.actors !== null
							? this.state.actors.length + " companies found"
							: "Loading"}
						</h3>
					</div>
				</div>

				{this.state.actors !== null && this.state.actors.length > 0
					&& <SimpleTable
						numberDisplayed={6}
						elements={this.state.actors.map((a, i) => [a, i])}
						buildElement={(a) => (
							<div className="col-md-6">
								<Company
									info={a}
								/>
							</div>
						)}
					/>
				}

				{this.state.actors !== null && this.state.actors.length === 0
					&& <Message
						text={"No entity found"}
						height={300}
					/>
				}

				{this.state.actors === null
					&& <div className="row">
						<div className="col-md-12">
							<Loading
								height={400}
							/>
						</div>
					</div>
				}

				<div className="row row-spaced">
					<div className="col-md-12">
						<h1>CYBERSECURITY Luxembourg selection</h1>
					</div>
				</div>

				<div className="row row-spaced">
					<div className="col-md-4">
						<Popup
							className={"Popup-full-size"}
							trigger={
								<div className="shadow-section blue-shadow-section centered-shadow-section">
									{/* eslint-disable no-script-url */}
									<a>
										<div>
											<h3>PC Doctors</h3>
											<i className="fas fa-user-md"/>
											<div className="PageHome-newsletter-content-desc">
												See the list of companies providing services in order
												to support the individuals
											</div>
										</div>
									</a>
								</div>
							}
							onOpen={this.getPCDoctors}
							modal
						>
							{(close) => (
								<div className={"row PageHome-how-to-use-content"}>
									<div className={"col-md-12"}>
										{// eslint-disable-next-line
										}<h2>PC Doctors</h2>
										<div className="top-right-buttons">
											<button
												className={"red-background"}
												onClick={close}>
												<i className="fas fa-times"/>
											</button>
										</div>
									</div>

									{this.state.pcDoctors
										? <div className={"col-md-12"}>
											<div className={"row"}>
												{this.state.pcDoctors.map((c) => <div
													key={c.id}
													className={"col-md-6"}>
													<Company
														info={c}
													/>
												</div>)}
											</div>
										</div>
										: <div className={"col-md-12"}>
											<Loading
												height={300}
											/>
										</div>
									}
								</div>
							)}
						</Popup>
					</div>
					<div className="col-md-4">
						<Popup
							className={"Popup-full-size"}
							trigger={
								<div className="shadow-section blue-shadow-section centered-shadow-section">
									{/* eslint-disable no-script-url */}
									<a>
										<div>
											<h3>Pure Cyber Startups</h3>
											<i className="fas fa-rocket"/>
											<div className="PageHome-newsletter-content-desc">
												Have a look on the startups with cybersecurity
												as a core business
											</div>
										</div>
									</a>
								</div>
							}
							onOpen={this.getCoreStartups}
							modal
						>
							{(close) => (
								<div className={"row PageHome-how-to-use-content"}>
									<div className={"col-md-12"}>
										{// eslint-disable-next-line
										}<h2>Pure Cyber Startups</h2>
										<div className="top-right-buttons">
											<button
												className={"red-background"}
												onClick={close}>
												<i className="fas fa-times"/>
											</button>
										</div>
									</div>

									{this.state.coreStartups
										? <div className={"col-md-12"}>
											<div className={"row"}>
												{this.state.coreStartups.map((c) => <div
													key={c.id}
													className={"col-md-6"}>
													<Company
														info={c}
													/>
												</div>)}
											</div>
										</div>
										: <div className={"col-md-12"}>
											<Loading
												height={300}
											/>
										</div>
									}
								</div>
							)}
						</Popup>
					</div>
					<div className="col-md-4">
						<div className="shadow-section red-shadow-section centered-shadow-section">
							{/* eslint-disable no-script-url */}
							<a
								href={getPrivateSpaceURL()}
								target="_blank"
								rel="noreferrer">
								<div>
									<h3>My CYBERLUX</h3>
									<i className="fas fa-plug"/>
									<div className="PageHome-newsletter-content-desc">
										Register or update your company and show the best
										of your organisation
									</div>
								</div>
							</a>
						</div>
					</div>
				</div>

				<div className="row row-spaced">
					<div className="col-md-12">
						<h1>Dashboard</h1>
					</div>

					{this.state.actors !== null && this.state.actors.length > 0
						&& <div className="col-md-12 row-spaced">
							{this.state.actors !== null
								? <VennActorDistribution
									actors={this.state.actors !== null ? this.state.actors : []}
								/>
								: <Loading
									height={400}
								/>
							}
						</div>
					}

					{this.state.actors !== null && this.state.actors.length === 0
						&& <Message
							text={"No entity found"}
							height={300}
						/>
					}

					<div className="col-md-6">
						<h3>Age of companies</h3>
						{this.state.actors !== null && this.state.analytics !== null
							? <BarActorAge
								actors={this.state.actors}
								addRangeFilter={(v) => this.manageFilter("age_range", v, "true")}
								selected={this.state.filters.age_range}
							/>
							:							<Loading
								height={300}
							/>
						}
					</div>

					<div className="col-md-6">
						<h3>Companies per size ranges</h3>
						{this.state.actors !== null && this.state.analytics !== null
							? <BarWorkforceRange
								actors={this.state.actors}
								workforces={this.state.analytics.workforces}
								companiesAsGranularity={true}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							:							<Loading
								height={300}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
