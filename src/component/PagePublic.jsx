import React from "react";
import "./PagePublic.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import Company from "./item/Company.jsx";
import SimpleTable from "./table/SimpleTable.jsx";
import PublicSectorSearch from "./form/PublicSectorSearch.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import { getMainAppURL } from "../utils/env.jsx";

export default class PagePublic extends React.Component {
	constructor(props) {
		super(props);

		this.getPublicCompany = this.getPublicCompany.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.modifyFilters = this.modifyFilters.bind(this);

		this.state = {
			actors: null,
			publicEntities: null,
			analytics: null,
			filters: {
				name: getUrlParameter("name"),
				taxonomy_values: getUrlParameter("taxonomy_values") !== null
					? getUrlParameter("taxonomy_values").split(",").map((v) => parseInt(v, 10)) : [],
			},
		};
	}

	componentDidMount() {
		this.getPublicCompany();
	}

	getPublicCompany() {
		this.setState({
			publicEntities: null,
		}, () => {
			getRequest.call(this, "public/get_public_companies?entity_type=PUBLIC SECTOR&"
				+ dictToURI(this.state.filters), (data) => {
				this.setState({
					publicEntities: data
						.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	onSearch() {
		// eslint-disable-next-line no-restricted-globals
		history.replaceState(null, null, "?" + dictToURI(this.state.filters));

		this.getPublicCompany();
	}

	modifyFilters(field, value) {
		const filters = { ...this.state.filters };
		filters[field] = value;
		this.setState({ filters });
	}

	render() {
		return (
			<div className={"PagePublic page max-sized-page"}>
				<div className="row">
					<div className="col-md-12">
						<Breadcrumb>
							<Breadcrumb.Item href={getMainAppURL()}>
								CYBERSECURITY LUXEMBOURG
							</Breadcrumb.Item>
							<Breadcrumb.Item><Link to="/">ECOSYSTEM</Link></Breadcrumb.Item>
							<Breadcrumb.Item><Link to="/publicsector">PUBLIC SECTOR</Link></Breadcrumb.Item>
						</Breadcrumb>
					</div>
				</div>

				<PublicSectorSearch
					taxonomy={this.props.taxonomy}
					filters={this.state.filters}
					onChange={this.modifyFilters}
					onSearch={this.onSearch}
				/>

				<div className="row">
					<div className="col-md-12">
						<h1>Public sector</h1>
					</div>
				</div>

				{this.state.publicEntities !== null && this.state.publicEntities.length > 0
					&& <SimpleTable
						numberDisplayed={10}
						elements={this.state.publicEntities.map((a, i) => [a, i])}
						buildElement={(a) => (
							<div className="col-md-6">
								<Company
									info={a}
								/>
							</div>
						)}
					/>
				}

				{this.state.publicEntities !== null && this.state.publicEntities.length === 0
					&& <Message
						text={"No entity found"}
						height={300}
					/>
				}

				{this.state.publicEntities === null
					&& <div className="row">
						<div className="col-md-12">
							<Loading
								height={400}
							/>
						</div>
					</div>
				}
			</div>
		);
	}
}
