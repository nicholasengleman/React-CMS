import React, {Component} from 'react';
import axios from 'axios';

import './App.css';

import {BrowserRouter as Router, Route} from "react-router-dom";
import Header from './Header/Header';
import Boards from './Boards/Boards';
import Sidebar from './Sidebar/Sidebar';
import ProductsContainer from './ProductsContainer/ProductsContainer';
import ConfirmationToast from './ConfirmationToast/ConfirmationToast';
import ProductComments from "./ProductComments/ProductComments";

class App extends Component {
	constructor(props) {
		super(props);
		this.baseproductList = [];
		this.basetags = [];
		this.searchFilterParameter = '';
		this.TagFilterParameters = [];
		this.FilteredProductList = [];
		this.PriceFilterParameters = {
			'Under $25': false,
			'$25 to $50': false,
			'$50 to $100': false,
			'$100 to $200': false,
			'$200 to $500': false,
			'$500 & above': false
		};
		this.state = {
			UserData: {
				Boards: [
					{
						name: 'Places to Go',
						boardID: 34343,
						pic: 'https://i.pinimg.com/564x/4d/9b/4f/4d9b4ff9801362c075528b45e5742b13.jpg',
						pins: [1, 2, 3]
					},
					{
						name: 'Recipies to make',
						boardID: 2323,
						pic: 'https://i.pinimg.com/564x/bd/a2/90/bda290318816d59a338c97bb6beaa203.jpg',
						pins: [4, 5, 6]
					}
				],
			},
			ConfirmationToast: {
				ShowConfirmationToast: false,
				ToastImage: '',
				ToastAction: '',
				ToastActionDestination: ''
			},
			activeIndex: 0,
			DisplayedProductList: [],
			MeetsPriceFilters: {},
			MeetsTagFilters: [],
			adminMode: false
		};
	}

	componentWillMount() {
		let t = this;
		axios.get('/api/GetAllProducts')
			.then(function (response) {
				const databaseData = response.data;

				function collectData(callback) {
					let ProjectData = [];
					for (let property1 in databaseData) {
						ProjectData.push({
							productName: databaseData[property1].name,
							productPrice: databaseData[property1].price,
							productImageAddress: databaseData[property1].productImageAddress,
							productTags: databaseData[property1].tags.split(","),
							productDescription: databaseData[property1].description,
							productKey: databaseData[property1].productKey
						});
					}
					callback(ProjectData);
				};
				collectData((ProjectData) => {
					t.findNumPoductsMatchPriceFilter(ProjectData);
					t.findNumPoductsMatchTagFilter(ProjectData);
					t.baseproductList = ProjectData;
					t.setState({DisplayedProductList: ProjectData});
				});
			});
	}


	addNewComment = (productID, comment, user, date) => {
		let ProductList = this.state.DisplayedProductList;
		const commentId = Math.random();
		if (ProductList[productID].comments) {
			ProductList[productID].comments.push({user, comment, date, commentId});
		} else {
			ProductList[productID].comments = [{user, comment, date, commentId}];
		}
		this.setState({DisplayedProductList: ProductList});
		this.displayConfirmationToast('', 'thanks for', 'your comment!');
	};

	deleteComment = (productKey, commentId) => {
		let ProductList = this.state.DisplayedProductList;
		ProductList[productKey - 1].comments = ProductList[productKey - 1].comments.filter((comment) => {
			return comment.commentId !== commentId;
		});
		this.setState({DisplayedProductList: ProductList});
	};

	openEditCommentWindow = (productKey, commentId) => {
		let ProductList = this.state.DisplayedProductList;
		ProductList[productKey - 1].comments.forEach((comment) => {
			if (comment.commentId === commentId) {
				comment['edit'] = true;
			}
		});
		this.setState({DisplayedProductList: ProductList});
	};

	editComment = (productKey, commentId, newCommentText) => {
		let ProductList = this.state.DisplayedProductList;
		ProductList[productKey - 1].comments.forEach((comment) => {
			if (comment.commentId === commentId) {
				comment.comment = newCommentText;
				comment.edit = false;
			}
		});
		this.setState({DisplayedProductList: ProductList});
	};

	addPinToExistingBoard = (productKey, productImage, boardID) => {
		let UserData = this.state.UserData;
		for (let board of UserData.Boards) {
			if (board.boardID === boardID) {
				board.pins.push(productKey);
				this.setState({UserData});
				this.displayConfirmationToast(productImage, 'Saved to', board.name);
			}
		}
	};

	addPinToNewBoard = (productKey, productImage, boardName) => {
		let UserData = this.state.UserData;
		UserData.Boards.push({
			name: boardName,
			boardID: Math.random(),
			pic: productImage,
			pins: [productKey]
		});
		this.setState({UserData});
		this.displayConfirmationToast(productImage, 'Saved to', boardName);
	};

	createNewBoard = (boardName) => {
		let UserData = this.state.UserData;
		UserData.Boards.push({
			name: boardName,
			boardID: Math.random()
		});
		this.setState({UserData});
		this.displayConfirmationToast('', 'New Board Created', boardName);
	};

	editBoard = (boardID, newBoardName, newBoardDescription) => {
		let UserData = this.state.UserData;
		UserData.Boards.forEach(board => {
			if(board.boardID === boardID) {
				if(newBoardName) {
					board.name = newBoardName;
				}
				if(newBoardDescription) {
					board.description = newBoardDescription;
				}
			}
		});
		this.setState({UserData});
		this.displayConfirmationToast('', 'Your board', 'has been updated');
	};

	deleteBoard = (boardID) => {
		let UserData = this.state.UserData;
		let boardname;
		UserData.Boards = UserData.Boards.filter(board => {
			if(board.boardID !== boardID) {
				return true;
			} else {
				boardname = board.name;
				return false;
			}
		});
		this.setState({UserData});
		this.displayConfirmationToast('', `"${boardname}" board`, 'has been deleted');
	};

	displayConfirmationToast = (ToastImage, ToastAction, ToastActionDestination) => {
		this.setState({
			ConfirmationToast:
				{
					ShowConfirmationToast: true,
					ToastImage,
					ToastAction,
					ToastActionDestination
				}
		});
		setTimeout(function () {
			this.setState({ConfirmationToast: {ShowConfirmationToast: false}});
		}.bind(this), 3500);
	};


	removeProduct = (productToRemove) => {
		this.baseproductList = this.baseproductList.filter(product => {
			if (product.productKey !== productToRemove) {
				return true;
			} else {
				return false;
			}
		});

		this.removeFromFavorites(productToRemove);

		this.basetags = [];
		this.setState({DisplayedProductList: this.filterProductsByTag(this.filterProductsByPrice(this.filterProductsBySearch()))});
		this.findNumPoductsMatchPriceFilter(this.FilteredProductList);
		this.findNumPoductsMatchTagFilter(this.FilteredProductList);
	};

	editProduct = (productToRemove) => {
		this.baseproductList = this.baseproductList.filter(product => {
			if (product.productKey !== productToRemove) {
				return true;
			} else {
				return false;
			}
		});
	};


	updateSearchParameter = (searchParameter) => {
		this.searchFilterParameter = searchParameter;
		this.setState({DisplayedProductList: this.filterProductsByTag(this.filterProductsByPrice(this.filterProductsBySearch()))});
		this.findNumPoductsMatchPriceFilter(this.FilteredProductList);
		this.findNumPoductsMatchTagFilter(this.FilteredProductList);
	};

	updatePriceFilter = (filter) => {
		this.PriceFilterParameters = {
			...this.PriceFilterParameters,
			[filter]: !this.PriceFilterParameters[filter]
		};
		this.setState({DisplayedProductList: this.filterProductsByTag(this.filterProductsByPrice(this.filterProductsBySearch()))});
		this.findNumPoductsMatchTagFilter(this.FilteredProductList);
		if (this.FilteredProductList.length === this.baseproductList.length) {
			this.findNumPoductsMatchPriceFilter(this.FilteredProductList);
		}
	};

	updateTagFilter = (filter) => {
		let filterAdded = false;
		if (this.TagFilterParameters.length < 1) {
			this.TagFilterParameters.push([filter, true]);
		} else {
			for (let e = 0; e < this.TagFilterParameters.length; e++) {
				if (this.TagFilterParameters[e][0] === filter) {
					this.TagFilterParameters[e] = [filter, !this.TagFilterParameters[e][1]];
					filterAdded = true;
					break;
				}
			}
			if (!filterAdded) {
				this.TagFilterParameters.push([filter, true]);
			}
		}

		this.setState({DisplayedProductList: this.filterProductsByTag(this.filterProductsByPrice(this.filterProductsBySearch()))});
		this.findNumPoductsMatchPriceFilter(this.FilteredProductList);
		if (this.FilteredProductList.length === this.baseproductList.length) {
			this.findNumPoductsMatchTagFilter(this.FilteredProductList);
		}
	};


	filterProductsByPrice = (editedproductList) => {
		let alwaysReturnTrue = false;
		let params = this.PriceFilterParameters;
		if (!params['Under $25'] && !params['$25 to $50'] && !params['$50 to $100'] && !params['$100 to $200'] && !params['$200 to $500'] && !params['$500 & above']) {
			alwaysReturnTrue = true;
		} else {
			alwaysReturnTrue = false;
		}
		return editedproductList.filter(product => {
			if (alwaysReturnTrue) {
				return true;
			}
			if (params['Under $25']) {
				if (product.productPrice < 25) {
					return true;
				}
			}
			if (params['$25 to $50']) {
				if (25 < product.productPrice && product.productPrice < 50) {
					return true;
				}
			}
			if (params['$50 to $100']) {
				if (50 < product.productPrice && product.productPrice < 100) {
					return true;
				}
			}
			if (params['$100 to $200']) {
				if (100 < product.productPrice && product.productPrice < 200) {
					return true;
				}
			}
			if (params['$200 to $500']) {
				if (200 < product.productPrice && product.productPrice < 500) {
					return true;
				}
			}
			if (params['$500 & above']) {
				if (500 < product.productPrice) {
					return true;
				}
			}
			return false;
		});
	};


	filterProductsBySearch = () => {
		return this.baseproductList.filter(product => {
			if (product.productName.search(this.searchFilterParameter) > -1) {
				return true;
			} else if (product.productDescription.search(this.searchFilterParameter) > -1) {
				return true;
			} else {
				return false;
			}
		});
	};

	filterProductsByTag = (editedproductList) => {
		let alwaysReturnTrue = false;
		let params = this.TagFilterParameters;
		if (params.length === 0) {
			alwaysReturnTrue = true;
		} else if (params.every(tag => tag[1] === false)) {
			alwaysReturnTrue = true;
		} else {
			alwaysReturnTrue = false;
		}
		let FilteredProductList = editedproductList.filter(product => {
			if (alwaysReturnTrue) {
				return true;
			}
			for (let e = 0; e < params.length; e++) {

				if (params[e][1] && (product.productTags.find(tag => tag === params[e][0]))) {
					return true;
				}
			}
			return false;
		});
		this.FilteredProductList = FilteredProductList;
		return FilteredProductList;
	};


	findNumPoductsMatchPriceFilter = (FilteredProductList) => {
		let priceUnder25 = 0, price25to50 = 0, price50to100 = 0, price100to200 = 0, price200to500 = 0, priceOver500 = 0;
		for (let product of FilteredProductList) {
			if (product.productPrice < 25) {
				priceUnder25++;
			}
			if (25 < product.productPrice && product.productPrice < 50) {
				price25to50++;
			}
			if (50 < product.productPrice && product.productPrice < 100) {
				price50to100++;
			}
			if (100 < product.productPrice && product.productPrice < 200) {
				price100to200++;
			}
			if (200 < product.productPrice && product.productPrice < 500) {
				price200to500++;
			}
			if (500 < product.productPrice) {
				priceOver500++;
			}
		}
		this.setState({
			MeetsPriceFilters: {
				priceUnder25,
				price25to50,
				price50to100,
				price100to200,
				price200to500,
				priceOver500
			}
		})
	};

	findNumPoductsMatchTagFilter = (FilteredProductList) => {
		let tagsCount;
		if (this.basetags.length > 0) {
			tagsCount = this.basetags;
			tagsCount.forEach(element => element[1] = 0);
		} else {
			tagsCount = [];
		}
		for (let product of FilteredProductList) {
			for (let tag of product.productTags) {
				let index = tagsCount.findIndex(element => (element[0] === tag));
				if (index > -1) {
					tagsCount[index][1]++;
				} else {
					tagsCount.push([tag, 1]);
				}
			}
		}
		this.basetags = tagsCount;
		this.setState({MeetsTagFilters: tagsCount});
	};

	addNewContent = () => {
		this.baseproductList.unshift({
			productImageAddress: '',
			productName: '',
			productPrice: '',
			productDescription: '',
			productTags: [],
			productKey: Math.random()
		});
		this.setState({DisplayedProductList: this.baseproductList});
	};

	submitNewProductInfo = (productKey, newTags, newImgSrc, newName, newPrice, newDescription) => {
		this.baseproductList.forEach(product => {
			if (product.productKey === productKey) {
				product.productImageAddress = newImgSrc;
				newTags.length > 0 && newTags[0] !== ""
					? product.productTags = newTags.split(',')
					: product.productTags = [];
				product.productName = newName;
				product.productPrice = newPrice;
				product.productDescription = newDescription;
			}
		});
		this.basetags = [];
		this.setState({DisplayedProductList: this.filterProductsByTag(this.filterProductsByPrice(this.filterProductsBySearch()))});
		this.findNumPoductsMatchPriceFilter(this.FilteredProductList);
		this.findNumPoductsMatchTagFilter(this.FilteredProductList);
	};

	toggleAdminMode = () => {
		this.setState({adminMode: !this.state.adminMode});
	};


	render() {
		return (
			<Router>
				<div>
					<Route exact path="/boards" render={() =>
						<Boards
							Boards={this.state.UserData.Boards}
							createNewBoard={this.createNewBoard}
							deleteBoard={this.deleteBoard}
							editBoard={this.editBoard}
						/>
					}/>

					<Route exact path="/products/:product" render={({match}) =>
						<ProductComments
							{...this.state.DisplayedProductList[match.params.product]}
							addNewComment={this.addNewComment}
							addPinToExistingBoard={this.addPinToExistingBoard}
							addPinToNewBoard={this.addPinToNewBoard}
							boards={this.state.UserData.Boards}
							deleteComment={this.deleteComment}
							editComment={this.editComment}
							openEditCommentWindow={this.openEditCommentWindow}
						/>}
					/>

					<Route exact path="/" render={() =>
						<Header
							adminMode={this.state.adminMode}

							filterProducts={this.updateSearchParameter}
							removeFromFavorites={this.removeFromFavorites}
							toggleAdminMode={this.toggleAdminMode}
						/>
					}/>

					<Route exact path="/" render={() =>
						<main className="homepage">
							<Sidebar
								MeetsPriceFilters={this.state.MeetsPriceFilters}
								adminMode={this.state.adminMode}

								updatePriceFilter={this.updatePriceFilter}
								updateTagFilter={this.updateTagFilter}
								addNewContent={this.addNewContent}
								MeetsTagFilters={this.basetags}
							/>

							<ProductsContainer
								products={this.state.DisplayedProductList}
								adminMode={this.state.adminMode}
								boards={this.state.UserData.Boards}

								searchString={this.searchFilterParameter}
								removeProduct={this.removeProduct}
								editProduct={this.editProduct}
								submitNewProductInfo={this.submitNewProductInfo}
								addPinToExistingBoard={this.addPinToExistingBoard}
								addPinToNewBoard={this.addPinToNewBoard}
								removeFromFavorites={this.removeFromFavorites}
							/>
						</main>
					}/>
					{
						this.state.ConfirmationToast.ShowConfirmationToast
						&& <ConfirmationToast ConfirmationToast={this.state.ConfirmationToast}/>
					}


				</div>
			</Router>
		);
	}
}

export default App;
