import React from "react";
import { SafeAreaView, View, ScrollView, Image, Text, } from "react-native";
export default (props) => {
	return (
		<SafeAreaView 
			style={{
				flex: 1,
				backgroundColor: "#FFFFFF",
			}}>
			<ScrollView  
				style={{
					flex: 1,
					backgroundColor: "#468585",
					borderRadius: 30,
				}}>
				<View >
					<View 
						style={{
							flexDirection: "row",
							alignItems: "flex-start",
							backgroundColor: "#50B498",
							borderRadius: 25,
							paddingLeft: 15,
							paddingRight: 33,
						}}>
						<Image
							source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/fqz9itgj.png"}} 
							resizeMode = {"stretch"}
							style={{
								width: 50,
								height: 50,
								marginTop: 46,
								marginBottom: 62,
								marginRight: 12,
							}}
						/>
						<Text 
							style={{
								color: "#FFFFFF",
								fontSize: 24,
								marginVertical: 63,
								flex: 1,
							}}>
							{"User Name"}
						</Text>
						<View 
							style={{
								alignItems: "center",
								marginTop: 65,
								marginBottom: 78,
							}}>
							<View 
								style={{
									alignItems: "flex-start",
								}}>
								<View 
									style={{
										width: 14,
										height: 14,
										backgroundColor: "#FFFFFF",
										borderRadius: 5,
										marginLeft: 11,
									}}>
								</View>
								<View 
									style={{
										width: 14,
										height: 14,
										backgroundColor: "#FFFFFF",
										borderRadius: 5,
									}}>
								</View>
							</View>
						</View>
					</View>
					<View 
						style={{
							backgroundColor: "#FFFFFF",
							borderRadius: 25,
							paddingTop: 26,
							paddingBottom: 10,
							marginHorizontal: 1,
						}}>
						<View 
							style={{
								alignItems: "center",
								marginBottom: 19,
							}}>
							<Text 
								style={{
									color: "#468585",
									fontSize: 40,
								}}>
								{"Your Plants"}
							</Text>
						</View>
						<View 
							style={{
								flexDirection: "row",
								alignItems: "flex-start",
								backgroundColor: "#E9E9F9",
								borderRadius: 60,
								paddingLeft: 21,
								paddingRight: 59,
								marginBottom: 18,
								marginHorizontal: 18,
							}}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 117,
									height: 117,
									marginVertical: 14,
									marginRight: 38,
								}}
							/>
							<View 
								style={{
									flex: 1,
									marginVertical: 26,
								}}>
								<Text 
									style={{
										color: "#2F2182",
										fontSize: 24,
										marginBottom: 20,
									}}>
									{"Plant Name"}
								</Text>
								<Text 
									style={{
										color: "#468585",
										fontSize: 20,
										marginBottom: 8,
										marginHorizontal: 16,
									}}>
									{"Plant Type"}
								</Text>
								<Text 
									style={{
										color: "#468585",
										fontSize: 20,
										marginHorizontal: 14,
									}}>
									{"Created at"}
								</Text>
							</View>
						</View>
						<View 
							style={{
								flexDirection: "row",
								alignItems: "flex-start",
								backgroundColor: "#E9E9F9",
								borderRadius: 60,
								paddingLeft: 21,
								paddingRight: 59,
								marginBottom: 20,
								marginHorizontal: 18,
							}}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/ofil4pbm.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 117,
									height: 117,
									marginVertical: 14,
									marginRight: 38,
								}}
							/>
							<View 
								style={{
									flex: 1,
									marginVertical: 26,
								}}>
								<Text 
									style={{
										color: "#2F2182",
										fontSize: 24,
										marginBottom: 20,
									}}>
									{"Plant Name"}
								</Text>
								<Text 
									style={{
										color: "#468585",
										fontSize: 20,
										marginBottom: 8,
										marginHorizontal: 16,
									}}>
									{"Plant Type"}
								</Text>
								<Text 
									style={{
										color: "#468585",
										fontSize: 20,
										marginHorizontal: 14,
									}}>
									{"Created at"}
								</Text>
							</View>
						</View>
						<View 
							style={{
								flexDirection: "row",
								alignItems: "flex-start",
								backgroundColor: "#E9E9F9",
								borderRadius: 60,
								paddingLeft: 21,
								paddingRight: 59,
								marginBottom: 127,
								marginHorizontal: 18,
							}}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/d710t4bd.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 117,
									height: 117,
									marginVertical: 14,
									marginRight: 38,
								}}
							/>
							<View 
								style={{
									flex: 1,
									marginVertical: 25,
								}}>
								<Text 
									style={{
										color: "#2F2182",
										fontSize: 24,
										marginBottom: 20,
									}}>
									{"Plant Name"}
								</Text>
								<Text 
									style={{
										color: "#468585",
										fontSize: 20,
										marginBottom: 8,
										marginHorizontal: 16,
									}}>
									{"Plant Type"}
								</Text>
								<Text 
									style={{
										color: "#468585",
										fontSize: 20,
										marginHorizontal: 14,
									}}>
									{"Created at"}
								</Text>
							</View>
						</View>
						<View 
							style={{
								flexDirection: "row",
								alignItems: "center",
								backgroundColor: "#1A5D5D",
								borderRadius: 35,
								paddingVertical: 9,
								paddingHorizontal: 11,
								marginHorizontal: 9,
							}}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/97l6jtly.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 60,
									height: 60,
									marginRight: 15,
								}}
							/>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/jk4wywuj.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 60,
									height: 60,
									marginRight: 15,
								}}
							/>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/v1j30yao.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 60,
									height: 60,
									marginRight: 15,
								}}
							/>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/3lotfa27.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 60,
									height: 60,
									marginRight: 15,
								}}
							/>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/wbhhgpdq.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 60,
									height: 60,
								}}
							/>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}