import React from "react";
import "./PrivateSpaceMyCompanies.css";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import _ from "lodash";
import Collapsible from "react-collapsible";
import FormLine from "../form/FormLine.jsx";
import Address from "../form/Address.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Company from "../item/Company.jsx";
import Info from "../box/Info.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";

export default class PrivateSpaceMyCompanies extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.submitModificationRequests = this.submitModificationRequests.bind(this);
		this.submitCompanyRequest = this.submitCompanyRequest.bind(this);
		this.submitCompanyLogo = this.submitCompanyLogo.bind(this);
		this.updateCompanies = this.updateCompanies.bind(this);
		this.onDrop = this.onDrop.bind(this);

		this.state = {
			companies: null,
			originalCompanies: null,
			addresses: null,
			originalAddresses: null,

			imageContent: null,

			entity: null,

			fields: {
				name: "Name",
				type: "Type",
				description: "Description",
				rscl_number: "RCSL number",
				website: "Website",
				creation_date: "Creation date",
				is_cybersecurity_core_business: "Is cybersecurity core business",
				is_startup: "Is startup",
				is_targeting_sme: "Is targeting SMEs",
			},
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			companies: null,
			imageContent: null,
		});

		getRequest.call(this, "privatespace/get_my_companies", (data) => {
			this.setState({
				companies: data.companies,
				originalCompanies: data.companies,
				addresses: data.addresses,
				originalAddresses: data.addresses,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitModificationRequests(company) {
		const info = {
			company,
			addresses: this.state.addresses.filter((a) => a.company_id === company.id),
		};

		const params = {
			request:
				"[ENTITY MODIFICATION]\n\n"
				+ "The user requests modifications on the following entity: " + company.name
				+ "\n\n"
				+ JSON.stringify(info, null, 4),
		};

		postRequest.call(this, "privatespace/add_request", params, () => {
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitCompanyRequest() {
		const params = {
			request: "[ENTITY ACCESS]\n\n"
				+ "The user requests the access to this entity: "
				+ this.state.entity,
		};

		postRequest.call(this, "privatespace/add_request", params, () => {
			this.setState({
				entity: null,
			});
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitCompanyLogo(company) {
		const info = {
			id: company.id,
		};

		const params = {
			request:
				"[ENTITY LOGO MODIFICATION]\n\n"
				+ "The user requests modifications of the logo on the following entity: " + company.name
				+ "\n\n"
				+ JSON.stringify(info, null, 4),
			image: this.state.imageContent,
		};

		postRequest.call(this, "privatespace/add_request", params, () => {
			this.setState({
				imageContent: null,
			});
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getModifiedFields(c1, c2) {
		const fields = [];

		// Compare global information

		Object.entries(c1).forEach(([key]) => {
			if (c1[key] !== c2[key]) fields.push(this.state.fields[key]);
		});

		// Compare addresses

		const originalAddresses = this.state.originalAddresses.filter((a) => a.company_id === c1.id);
		const addresses = this.state.addresses.filter((a) => a.company_id === c1.id);

		const minLength = Math.min(originalAddresses.length, addresses.length);

		for (let i = 0; i < minLength; i++) {
			if (JSON.stringify(originalAddresses) !== JSON.stringify(addresses)) fields.push("Address " + (i + 1));
		}

		for (let i = minLength; i < originalAddresses.length; i++) {
			fields.push("Address " + (minLength + i + 1));
		}

		for (let i = minLength; i < addresses.length; i++) {
			fields.push("Address " + (minLength + i + 1));
		}

		return fields.join(", ");
	}

	updateCompanies(index, field, value) {
		const c = JSON.parse(JSON.stringify(this.state.companies));
		c[index][field] = value;
		this.setState({ companies: c });
	}

	updateAddresses(index, field, value) {
		const c = JSON.parse(JSON.stringify(this.state.addresses));
		c[index][field] = value;
		this.setState({ addresses: c });
	}

	onDrop(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({
				imageContent: null,
			});
		} else {
			const reader = new FileReader();

			reader.onabort = () => console.log("File reading was aborted");
			reader.onerror = () => console.log("An error happened while reading the file");
			reader.onload = () => {
				this.setState({ imageContent: reader.result, importError: null });
			};

			reader.readAsDataURL(files[0]);
		}
	}

	static isFieldCompleted(v) {
		return v !== undefined && v.length > 0;
	}

	render() {
		return (
			<div className="PrivateSpaceMyCompanies">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>My entities</h1>
					</div>

					{this.state.companies !== null && this.state.companies.length > 0
						&& this.state.companies.map((c, i) => (
							<div className="col-md-12" key={c.id}>
								<Company
									info={c}
								/>
								<Collapsible
									trigger={<div className={"PrivateSpaceMyCompanies-show-detail"}>Show details</div>}
								>
									<h2>Logo</h2>
									{this.state.imageContent === null
										? <Dropzone
											accept=".png,.jpg,.jpeg"
											disabled={false}
											onDrop={this.onDrop}
										>
											{({ getRootProps, getInputProps }) => (
												<div
													className={"PrivateSpaceMyCompanies-dragdrop"}
													{...getRootProps()}>
													<input {...getInputProps()} />
													<div className="PrivateSpaceMyCompanies-dragdrop-textContent">
														<i className="far fa-image"/>
														<div>Drag and drop the file here</div>
														<div>must be .jpg, .jpeg or .png</div>
														<div>maximum size of 500x500 size</div>
													</div>
												</div>
											)}
										</Dropzone>
										: <img
											className="PrivateSpaceMyCompanies-logo-change"
											src={this.state.imageContent}
										/>
									}
									<div className={"right-buttons block-buttons"}>
										<button
											className={"blue-background"}
											disabled={this.state.imageContent === null}
											onClick={() => this.submitCompanyLogo(c)}
										>
											<i className="fas fa-save"/> Request logo change
										</button>
										<button
											className={"blue-background"}
											disabled={this.state.imageContent === null}
											onClick={() => this.setState({ imageContent: null })}
										>
											<i className="fas fa-times-circle"/> Remove the selection
										</button>
									</div>

									<h2>Global information</h2>
									<FormLine
										label={this.state.fields.name}
										value={c.name}
										onChange={(v) => this.updateCompanies(i, "name", v)}
									/>
									<FormLine
										label={this.state.fields.description}
										type={"textarea"}
										value={c.description}
										onChange={(v) => this.updateCompanies(i, "description", v)}
									/>
									<FormLine
										label={this.state.fields.rscl_number}
										value={c.rscl_number}
										onChange={(v) => this.updateCompanies(i, "rscl_number", v)}
									/>
									<FormLine
										label={this.state.fields.website}
										value={c.website}
										onChange={(v) => this.updateCompanies(i, "website", v)}
									/>
									<FormLine
										label={this.state.fields.creation_date}
										type={"date"}
										value={c.creation_date}
										onChange={(v) => this.updateCompanies(i, "creation_date", v)}
									/>
									<FormLine
										label={this.state.fields.is_cybersecurity_core_business}
										type={"checkbox"}
										value={c.is_cybersecurity_core_business}
										onChange={(v) => this.updateCompanies(i, "is_cybersecurity_core_business", v)}
										background={false}
									/>
									<FormLine
										label={this.state.fields.is_startup}
										type={"checkbox"}
										value={c.is_startup}
										onChange={(v) => this.updateCompanies(i, "is_startup", v)}
										background={false}
									/>
									<FormLine
										label={this.state.fields.is_targeting_sme}
										type={"checkbox"}
										value={c.is_targeting_sme}
										onChange={(v) => this.updateCompanies(i, "is_targeting_sme", v)}
										background={false}
									/>

									{this.state.addresses.map((a, y) => {
										if (a.company_id === c.id) {
											return (
												<div key={a.company_id}>
													<h2>Address</h2>
													<Address
														info={a}
														onChange={(f, v) => this.updateAddresses(y, f, v)}
													/>
												</div>
											);
										}
										return null;
									})}

									<div className={"right-buttons"}>
										<DialogConfirmation
											text={"Do you want to request modifications for those fields : "
												+ this.getModifiedFields(c, this.state.originalCompanies[i]) + " ?"}
											trigger={
												<button
													className={"blue-background"}
													disabled={_.isEqual(c, this.state.originalCompanies[i])
														&& _.isEqual(
															this.state.addresses.filter((a) => a.company_id === c.id),
															this.state.originalAddresses.filter((a) => a.company_id === c.id),
														)
													}
												>
													<i className="fas fa-save"/> Request modifications
												</button>
											}
											afterConfirmation={() => this.submitModificationRequests(
												c,
												this.state.originalCompanies[i],
											)}
										/>
									</div>
								</Collapsible>
							</div>
						))
					}

					{this.state.companies !== null && this.state.companies.length === 0
						&& <div className="col-md-12">
							<Message
								text={"No entity found"}
								height={150}
							/>
						</div>
					}

					{this.state.companies === null
						&& <div className="col-md-12">
							<Loading
								height={150}
							/>
						</div>
					}
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Claim access to an entity already in our database</h1>
					</div>

					<div className="col-md-12">
						<Info
							content={
								<div>
									You can request the control of the data of the entity you are part of.<br/><br/>
									To confirm the access granting,
									one of out operator will get contact with you in the shortest delay.<br/>
									Make sure you have filled your personal information in the <b>Account</b> section.
								</div>
							}
						/>
						<FormLine
							label={"Name of the entity"}
							fullWidth={true}
							value={this.state.entity}
							onChange={(v) => this.setState({ entity: v })}
						/>
						<div className="right-buttons">
							<button
								onClick={this.submitCompanyRequest}
								disabled={this.state.entity === null || this.state.entity.length === 0}>
								<i className="fas fa-paper-plane"/> Send
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}