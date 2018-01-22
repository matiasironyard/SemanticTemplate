import React, { Component } from 'react';
import { render } from 'react-dom';
import {
	Segment,
	Grid,
	Feed,
	Image,
	Header,
	Divider,
	Button,
	Tab,
	Item,
	Menu,
	Loader,
	Dimmer,
	Icon,
	Label,
	Card,
	Sticky,
	Container
} from 'semantic-ui-react';
import graph from 'fb-react-sdk';
import moment from 'moment';
import Instafeed from 'react-instafeed';
import InstafeedJs from 'instafeed.js';
import { Timeline } from 'react-twitter-widgets';
import ReactHtmlParser, {
	processNodes,
	convertNodeToElement,
	htmlparser2
} from 'react-html-parser';

let loader = (
	<Dimmer active>
		<Loader />
	</Dimmer>
);

class BlogFeed extends Component {
	constructor(props) {
		super(props);
		this.state = {
			blogData: null,
			loading: true,
			isLoaded: false,
			ok: false,
			message: 'Connecting...'
		};
	}

	componentDidMount() {
		let self = this;
		fetch('https://yelp-proxy-server.herokuapp.com/mlk')
			.then(response => {
				this.setState({ ok: true, message: 'Loading posts...' });
				return response.json();
			})
			.then(data => {
				let post = data.objects.map(item => {
					let postDate = moment(item.created_time).format('MMMM Do YYYY');
					let id = item.created_time;
					let title = item.title;
					let postBody = item.rss_summary;
					postBody = ReactHtmlParser(postBody)[0].props.children[0];
					let image = item.featured_image.replace(/^http:/, 'https:');
					let subtitle = item.meta_description;
					let authorData = item.blog_post_author;
					let url = item.absolute_url;
					let created = item.created_time;
					return {
						postDate,
						id,
						title,
						subtitle,
						image,
						authorData,
						url,
						created,
						postBody
					};
				});
				self.setState({ loading: false, blogData: post });
			})
			.catch(error => console.log('error is', error));
	}

	render() {
		const { blogData, ok, loading, message } = this.state;
		let BlogEvent;
		if (ok && blogData) {
			BlogEvent = blogData.map(item => {
				const id = item.created;
				let postBody = item.postBody;
				let postDate = item.postDate;
				let title = item.title;
				let subtitle = item.subtitle;
				let authorData;
				if (item.authorData) {
					authorData = {
						name: item.authorData.display_name,
						avatar: item.authorData.avatar.replace(/^http:/, 'https:'),
						email: item.authorData.email
					};
				}
				let url = item.url;
				let image = item.image;
				return (
					<Item key={id}>
						<Image
							style={{
								paddingBottom: '20px',
								height: '300px',
								width: '250px',
								objectFit: 'cover'
							}}
							src={image}
						/>

						<Item.Content style={{ height: '100%' }} className="blog-post">
							<Item.Meta>
								<Header
									as="h2"
									style={{ textTransform: 'uppercase', color: '#2c95b5' }}>
									{title}
								</Header>
								{/*<Header
									color="grey"
									as="h4"
									style={{ textTransform: "uppercase" }}>
									{subtitle}
								</Header>*/}
							</Item.Meta>
							<Divider />

							<Feed size="large">
								<Feed.Event>
									<Feed.Label image={authorData.avatar} />

									<Feed.Content>
										<Feed.Summary>
											<a>{authorData.name}</a> posted on
											<Feed.Date>{postDate}</Feed.Date>
										</Feed.Summary>
										<Feed.Extra text style={{ fontSize: '120%' }}>
											{subtitle}
										</Feed.Extra>
										<Feed.Meta>
											<Feed.Like>
												<Button
													link="true"
													href={url}
													target="_blank"
													basic
													color="blue"
													style={{ marginTop: '15px' }}>
													<Icon name="chevron right" />Read Post
												</Button>
											</Feed.Like>
										</Feed.Meta>
									</Feed.Content>
								</Feed.Event>
							</Feed>
						</Item.Content>
					</Item>
				);
			});
		} else {
			return (
				<div style={{ height: '800px' }}>
					<Dimmer active>
						{message}
						<Loader />
					</Dimmer>
				</div>
			);
		}

		return (
			<Item.Group
				divided
				relaxed
				style={{ height: '800px', overflow: 'auto', paddingRight: '15px' }}>
				{BlogEvent}
			</Item.Group>
		);
	}
}

class FacebookFeed extends Component {
	constructor(props) {
		super(props);
		this.state = {
			facebookData: null,
			loading: true,
			message: ''
		};
	}

	componentDidMount() {
		let self = this;
		self.setState({ message: 'Loading feed' });
		graph.setAccessToken('527935110921167|UbnboMCmv1TLy8-oOFlBmgzlVQI');
		graph.get(
			'MillikenFloors?fields=about,cover,description,link,posts{created_time,icon,full_picture,picture,permalink_url,likes,shares,message}',
			function(err, res) {
				self.setState({ facebookData: res, loading: false });
			}
		);
	}

	render() {
		let { message, loading, facebookData } = this.state;
		let feedItems;
		console.log('this state', this.state.data);

		if (this.state.loading == false && this.state.facebookData.posts.data) {
			const feed = this.state.facebookData.posts.data;
			feedItems = feed.map(post => {
				let postDate = moment(post.created_time).format(
					'MMMM Do YYYY, h:mm:ss a'
				);
				let shareCount;
				if (post.shares) {
					shareCount = post.shares.count;
				}
				let likeCount;
				if (post.likes) {
					likeCount = post.likes.data.length;
				}

				let id = post.id;
				return (
					<Feed.Event key={id}>
						<Feed.Label>
							<img src="https://scontent-atl3-1.xx.fbcdn.net/v/t1.0-1/p200x200/14067453_1273636762647082_8217358398956779595_n.png?oh=d1867f199a8d05974f3c0ded8c542588&oe=5AFC4940" />
						</Feed.Label>
						<Feed.Content>
							<Feed.Summary>
								<Feed.User>Milliken Floors</Feed.User> posted on:
								<Feed.Date>{postDate}</Feed.Date>
							</Feed.Summary>
							<Feed.Extra text>{post.message}</Feed.Extra>
							<Feed.Extra>
								<Image
									src={post.full_picture}
									as="a"
									size="small"
									href={post.permalink_url}
									target="_blank"
								/>
							</Feed.Extra>
							<Feed.Meta>
								<Feed.Like>
									{shareCount ? (
										<span>
											<Icon name="share" />
											<span>{shareCount}</span>
											<span> shares</span>
										</span>
									) : (
										''
									)}
								</Feed.Like>
								<Feed.Like>
									{shareCount ? (
										<span>
											<Icon name="like" />
											<span>{likeCount}</span>
											<span> likes</span>
										</span>
									) : (
										''
									)}
								</Feed.Like>
							</Feed.Meta>
						</Feed.Content>
					</Feed.Event>
				);
			});
		}
		return (
			<div style={{ height: '100%', overflow: 'auto' }}>
				{this.state.loading ? (
					loader
				) : (
					<div>
						<div
							style={{
								backgroundImage:
									'url(' + this.state.facebookData.cover.source + ')',
								height: '150px',
								backgroundSize: 'cover'
							}}
						/>
						<iframe
							src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fpg%2FMillikenFloors&width=122&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=725922444274145"
							style={{
								height: '50px',
								paddingTop: '20px',
								border: 'none',
								overflow: 'hidden',
								scrolling: 'no',
								frameBorder: '0',
								allowTransparency: 'true',
								position: 'relative',
								left: '-20px'
							}}
						/>
					</div>
				)}
				<Divider />
				<Feed>
					{this.state.loading ? (
						<Dimmer active>
							{message}
							<Loader />
						</Dimmer>
					) : (
						feedItems
					)}
				</Feed>
			</div>
		);
	}
} 

class InstagramFeed extends Component {
	constructor() {
		super();
		this.state = { instagramFeed: '', loading: true, message: 'Loading feed' };
	}
	componentDidMount() {
	 console.log('in', this.props)
	}

	render() {
		let instagramCard;
		let { instagramFeed, loading, message } = this.state;
		if (this.state.loading == false && this.state.instagramFeed) {
			instagramCard = instagramFeed.map(card => {
				return (
					<Card
						centered
						style={{ width: '90%' }}
						color="blue"
						href={card.link}
						target="_blank"
						key={card.id}
						image={card.images.standard_resolution.url}
						extra={
							<div>
								<Feed size="large">
									<Feed.Event>
										<Feed.Label image={card.user.profile_picture} />
										<Feed.Content>
											<Feed.Extra text>{card.caption.text}</Feed.Extra>
										</Feed.Content>
									</Feed.Event>
								</Feed>
								<Divider />
								<a>
									<Icon name="like" />
									{card.likes.count} likes
								</a>
							</div>
						}
					/>
				);
			});
		}

		return (
			<div id="instafeed" style={{ height: '100%' }}>
				{loading ? (
					<Dimmer active>
						{message}
						<Loader />
					</Dimmer>
				) : (
					<div style={{ overflow: 'auto', height: '100%' }}>
						<div style={{ height: 'auto' }}>{instagramCard}</div>
					</div>
				)}
			</div>
		);
	}
}

class TwitterFeed extends Component {
	constructor() {
		super();
		this.state = { twData: null };
	}
	componentDidMount() {
		this.setState({ twData: this.props.twData.twFeed });
	}

	render() {
		let { twData } = this.state;
		return <div>{twData ? twData : loader}</div>;
	}
}

class SocialPanes extends Component {
	constructor() {
		super();
		this.state = {
			activePane: null,
			activeItem: 'Facebook',
			socialcolor: 'blue',
			isDisabled: 'grey',
			igData: null,
			twData: null,
			fbData: null
		};
	}
	handleItemClick = (e, { name, renderfeed, socialcolor }) => {
		this.setState({
			activeItem: name,
			activePane: renderfeed,
			socialcolor: socialcolor
		});
	};
	componentWillMount() {
		let data = this.props.appState.fbData;
		this.setState({ activePane: <FacebookFeed fbData={data} /> });
	}
	componentDidMount() {
		let fbData = this.props.appState.fbData;
		let igData = this.props.appState.igData;
		let twData = this.props.appState.twData;
		this.setState({ igData: igData, twData: twData, fbData: fbData });
	}

	render() {
		const {
			activeItem,
			activePane,
			socialcolor,
			isDisabled,
			fbData,
			igData,
			twData
		} = this.state;
		const facebook = activePane;
		return (
			<div>
				<Menu
					attached="top"
					tabular
					color={`${socialcolor}`}
					style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
					<Menu.Item
						style={{ color: `${isDisabled}` }}
						name="Facebook"
						icon="facebook f"
						active={activeItem === 'Facebook'}
						renderfeed={<FacebookFeed fbData={fbData} />}
						socialcolor="blue"
						onClick={this.handleItemClick}
					/>
					<Menu.Item
						style={{ color: `${isDisabled}` }}
						name="Twitter"
						icon="twitter"
						active={activeItem === 'Twitter'}
						renderfeed={<TwitterFeed twData={twData} />}
						socialcolor="teal"
						onClick={this.handleItemClick}
					/>
					<Menu.Item
						style={{ color: `${isDisabled}` }}
						name="Instagram"
						icon="instagram"
						active={activeItem === 'Instagram'}
						renderfeed={<InstagramFeed igData={igData} />}
						socialcolor="violet"
						onClick={this.handleItemClick}
					/>
				</Menu>

				<Segment attached="bottom" style={{ height: '845px' }}>
					{this.state.activePane}
				</Segment>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			//Loading?
			loadingMessage: 'Getting feeds...',
			//Blog State
			blogData: null,
			blogLoading: true,
			blogHasLoaded: false,
			ok: false,
			blogMessage: 'Connecting...',
			//FB state
			fbData: {
				fbMessage: '',
				fbFeed: { posts: { data: [] } },
				fbLoading: true
			},
			//Instagram state
			igData: {
				igFeed: '',
				igLoading: true,
				igMessage: 'Loading feed'
			},
			//Twitter state
			twData: {
				twLoading: true,
				twFeed: ''
			}
		};
		this.getBlogData = this.getBlogData.bind(this);
		this.getFacebook = this.getFacebook.bind(this);
		this.getTwitter = this.getTwitter.bind(this);
		this.getInstagram = this.getInstagram.bind(this);
	}
	handleContextRef = contextRef => this.setState({ contextRef });

	getBlogData() {
		fetch('https://yelp-proxy-server.herokuapp.com/mlk')
			.then(response => {
				this.setState({ ok: true, message: 'Loading posts...' });
				return response.json();
			})
			.then(data => {
				let post = data.objects.map(item => {
					let postDate = moment(item.created_time).format('MMMM Do YYYY');
					let id = item.created_time;
					let title = item.title;
					let postBody = item.rss_summary;
					postBody = ReactHtmlParser(postBody)[0].props.children[0];
					let image = item.featured_image.replace(/^http:/, 'https:');
					let subtitle = item.meta_description;
					let authorData = item.blog_post_author;
					let url = item.absolute_url;
					let created = item.created_time;
					return {
						postDate,
						id,
						title,
						subtitle,
						image,
						authorData,
						url,
						created,
						postBody
					};
				});
				this.setState({ blogLoading: false, blogData: post });
			})
			.catch(error => console.log('error is', error));
	}

	getFacebook() {
		let self = this;
		this.setState({ fbMessage: 'Loading feed' });
		graph.setAccessToken('527935110921167|UbnboMCmv1TLy8-oOFlBmgzlVQI');
		graph.get(
			'MillikenFloors?fields=about,cover,description,link,posts{created_time,icon,full_picture,picture,permalink_url,likes,shares,message}',
			function(err, res) {
				console.log('res', res.posts.data.length);
				if (res.posts.data.length === 25) {
					self.setState({
						fbData: { fbFeed: res, fbLoading: false, fbMessage: 'Loaded' }
					});
				} else {
					return;
				}
			}
		);
	}

	getTwitter() {
		return this.setState({
			twData: {
				twFeed: (
					<Timeline
						dataSource={{
							sourceType: 'profile',
							screenName: 'millikenfloors'
						}}
						options={{
							height: '800',
							overflow: 'auto'
						}}
						onLoad={() => console.log('Timeline is loaded!')}
					/>
				)
			}
		});
	}

	getInstagram() {
		let self = this;
		let feedArray = [];
		let feed = new InstafeedJs({
			get: 'user',
			userId: 1413942784,
			accessToken: '1413942784.c90d346.8c4b0d45f559456f8807fb3b83996b94',
			filter: function(image) {
				feedArray.push(image);
				if (feedArray.length) {
					self.setState({
						igData: {
							igMessage: 'done',
							igFeed: feedArray,
							igLoading: false
						}
					});
				} else {
					return;
				}
			}
		});

		feed.run();
	}

	componentDidMount() {
		//*****************Blog Feed*****************//
		this.getBlogData();
		this.getFacebook();
		this.getInstagram();
		this.getTwitter();
	}

	render() {
		const { blogData, fbData, igData, twData, loadingMessage } = this.state;
		const appData = this.state;
		console.log('ig', twData);
		let loadSocial = false;
		if (
			fbData.fbFeed.posts.data.length === 25 &&
			igData.igFeed.length === 20 &&
			twData.twFeed != null
		) {
			loadSocial = true;
		} else {
			return 0;
		}

		let appLoader = (
			<Dimmer active>
				{loadingMessage}
				<Loader />
			</Dimmer>
		);

		return (
			<Grid padded relaxed centered>
				<Grid.Row columns={2}>
					<Grid.Column mobile={16} tablet={16} computer={9} widescreen={8}>
						<Header as="h2" color="blue">
							FEATURED POSTS
							<Header.Subheader color="grey" style={{ fontWeight: 'bold' }}>
								FROM THE MILLIKEN FLOORING BLOG
							</Header.Subheader>
						</Header>
						<Divider />

						<Segment>
							<BlogFeed blogData={appData.blogData} />
						</Segment>
					</Grid.Column>

					<Grid.Column
						style={{ paddingTop: '18px' }}
						textAlign="center"
						mobile={16}
						tablet={16}
						computer={6}
						widescreen={4}>
						{loadSocial ? (
							<SocialPanes appState={appData} />
						) : (
							<div>{appLoader}</div>
						)}
					</Grid.Column>
				</Grid.Row>
			</Grid>
		);
	}
}

render(<App />, document.getElementById('root'));
