import React from 'react';
import {Link} from "react-router-dom";

import EditBoardModal from './EditBoardModal/EditBoardModal';
import CreateBoardModal from './CreateBoardModal/CreateBoardModal'

import {Text, Icon, IconButton} from "gestalt";

import "gestalt/dist/gestalt.css";
import './Boards.css';

class Boards extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displayModal_CreateBoard: false,
			displayModal_EditBoard: false,
		};

	}

	toggleCreateNewBoardModal = () => {
		this.setState({displayModal_CreateBoard: !this.state.displayModal_CreateBoard});
	};

	toggleEditBoardModal = (event) => {
		event.event.preventDefault();
		this.setState({displayModal_EditBoard: !this.state.displayModal_EditBoard});
	};


	createNewBoard = (createNewBoardInputValue) => {
		this.props.createNewBoard(createNewBoardInputValue);
		this.setState({displayModal_CreateBoard: false});
	};


	render() {
		return (
			<div>
				<Link to='/'>
					<div className='homepageLink'>
						<Icon accessibilityLabel='return to homepage' icon='arrow-back' color="darkGray" size='20'/>
						<Text bold size='md'>Home</Text>
					</div>
				</Link>
				<div className='myBoardsContainer'>

					<div className='myBoard'>
						<div className='myBoardView'>
							<IconButton accessibilityLabel='createBoard'
										icon='add-circle'
										iconColor='red'
										size='xl'
										onClick={this.toggleCreateNewBoardModal}
							/>
							<CreateBoardModal
								displayModal={this.state.displayModal_CreateBoard}
								toggleCreateNewBoardModal={this.toggleCreateNewBoardModal}
								createNewBoard={this.createNewBoard}
							/>
						</div>
						<div className='myBoardFooter'>
							<Text bold color="gray" size="lg">Create Board</Text>
						</div>
					</div>
					{this.props.Boards.map(board => (
						<Link to={`/boards/${board.boardID}`}>
							<div className='myBoard'>
								<div className='myBoardView'>
									{/*{*/}
										{/*board.pins.map(pin => (*/}
											{/*<img src={this.props.products[2].productImageAddress} alt="test"/>*/}
										{/*))*/}
									{/*}*/}
								</div>
								<div className='myBoardFooter'>
									<div>
										<Text bold color="maroon" size="lg">{board.name}</Text>
										<Text bold color="gray" size="md">{board.description}</Text>
									</div>

									<IconButton accessibilityLabel="edit Board"
												icon="edit"
												onClick={this.toggleEditBoardModal}
									/>
									<EditBoardModal
										displayModal={this.state.displayModal_EditBoard}
										toggleEditBoardModal={this.toggleEditBoardModal}
										deleteBoard={this.props.deleteBoard}
										editBoard={this.props.editBoard}
										board={board}
									/>
								</div>
							</div>
						</Link>
					))
					}
				</div>
			</div>
		)
	}
}

export default Boards;