import React from 'react';
import './SideBarButton.css';

class SideBarButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: false,
		};
		this.filterPrice = this.filterPrice.bind(this);
		this.filterTag = this.filterTag.bind(this);
	}

	filterPrice(event) {
		this.props.updatePriceFilter(this.props.text);
		this.setState(prevState => (
			{ selected: !prevState.selected }
		));
		event.preventDefault();
	}

	filterTag(event) {
		this.props.updateTagFilter(this.props.text);
		this.setState(prevState => (
			{ selected: !prevState.selected }
		));
		event.preventDefault();
	}

	render() {
		return (
			<div className={this.state.selected ? 'sideBarButton sideBarButton__Selected' : 'sideBarButton' +
				' sideBarButton__NotSelected'}>
				<button onClick={this.props.typeOfFilter === 'Price' ? this.filterPrice : this.filterTag}>{this.props.text}</button>
				<div className="filterBadge">{this.props.ProductsThatMeetFilter}</div>
			</div>
		)
	}
}

export default SideBarButton;