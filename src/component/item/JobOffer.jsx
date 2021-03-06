import React, { Component } from "react";
import "./JobOffer.css";
import dompurify from "dompurify";
import { dateToString } from "../../utils/date.jsx";
import { getMainAppURL } from "../../utils/env.jsx";

export default class JobOffer extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	getBoxContent() {
		return <div className="JobOffer card">
			<div className="card-body">
				<h5 className="card-title">{this.props.info.title}</h5>

				<div className="card-text">
					<div dangerouslySetInnerHTML={{
						__html:
						dompurify.sanitize(this.props.info.abstract),
					}} />
				</div>

				<button
					className={"blue-background"}
				>
					Know more
				</button>

				{this.props.hidePublicationDate === undefined
					|| this.props.hidePublicationDate === false
					? <div className="card-date">
						{dateToString(this.props.info.publication_date, "DD MMM YYYY")}
					</div>
					: ""}
			</div>
		</div>;
	}

	render() {
		return this.props.info.link !== null
			&& this.props.info.link !== undefined
			&& this.props.info.link.length > 0
			? <a
				href={this.props.info.link}
				target={"_blank"}
				rel="noreferrer"
				className="JobOffer-link">
				{this.getBoxContent()}
			</a>
			: <a
				href={getMainAppURL() + "news/" + this.props.info.handle}
				className="JobOffer-link">
				{this.getBoxContent()}
			</a>;
	}
}
