import React from "react";
import "./PagePrivateSector.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import Analytic from "./box/Analytic.jsx";
import { getRequest } from "../utils/request.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import Company from "./item/Company.jsx";
import SimpleTable from "./table/SimpleTable.jsx";
import ActorSearch from "./form/ActorSearch.jsx";
import BarWorkforceRange from "./chart/BarWorkforceRange.jsx";
import BarActorAge from "./chart/BarActorAge.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import VennActorDistribution from "./chart/VennActorDistribution.jsx";
import ButtonRegister from "./form/ButtonRegister.jsx";

export default class PagePrivateSector extends React.Component {
	constructor(props) {
		super(props);

		this.getCompanies = this.getCompanies.bind(this);
		this.getAnalytics = this.getAnalytics.bind(this);
		this.getTotalEmployees = this.getTotalEmployees.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.modifyFilters = this.modifyFilters.bind(this);

		this.state = {
			actors: null,
			analytics: null,
			filters: {
				name: getUrlParameter("name"),
				taxonomy_values: getUrlParameter("taxonomy_values") !== null
					? getUrlParameter("taxonomy_values").split(",").map((v) => parseInt(v, 10)) : [],
			},
		};
	}

	componentDidMount() {
		this.getCompanies();
		this.getAnalytics();
	}

	getCompanies() {
		getRequest.call(this, "public/get_public_companies?ecosystem_role=ACTOR&entity_type=PRIVATE SECTOR"
			+ dictToURI(this.state.filters), (data) => {
			this.setState({
				actors: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
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
		this.getAnalytics();
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
							<Breadcrumb.Item><Link to="/">CYBERSECURITY LUXEMBOURG</Link></Breadcrumb.Item>
							<Breadcrumb.Item><Link to="/privatesector">PRIVATE SECTOR</Link></Breadcrumb.Item>
						</Breadcrumb>
					</div>
				</div>

				<div className="row">
					<div className="col-md-12 right-buttons">
						<ButtonRegister/>
					</div>
				</div>

				<ActorSearch
					taxonomy={this.props.taxonomy}
					filters={this.state.filters}
					onChange={this.modifyFilters}
					onSearch={this.onSearch}
				/>

				<div className="row">
					<div className="col-md-12">
						<h1>{this.state.actors !== null ? this.state.actors.length + " " : ""}actors</h1>
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
						<h3>Total employees</h3>
						<div>
							{this.state.actors !== null && this.state.analytics !== null
								? <Analytic
									value={this.getTotalEmployees()}
									desc={"Total employees"}
								/>
								: <Loading
									height={300}
								/>
							}
						</div>
					</div>

					<div className="col-md-6">
						<h3>Employees per company size ranges</h3>
						{this.state.actors !== null && this.state.analytics !== null
							? <BarWorkforceRange
								actors={this.state.actors}
								workforces={this.state.analytics.workforces}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							:							<Loading
								height={300}
							/>
						}
					</div>

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