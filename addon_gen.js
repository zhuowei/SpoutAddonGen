var nameInput;
var versionInput;
var authorInput;
var modeInput;
var packageInput;
var mainClassInput;
var descriptionInput;
var generateButton;
var generateWithoutFlashButton;

function init() {
	nameInput = document.getElementById("plugin-name-input");
	versionInput = document.getElementById("plugin-version-input");
	authorInput = document.getElementById("plugin-author-input");
	//modeInput = document.getElementById("plugin-mode-input");
	packageInput = document.getElementById("plugin-package-input");
	mainClassInput = document.getElementById("plugin-mainclass-input");
	descriptionInput = document.getElementById("plugin-description-input");

	generateButton = document.getElementById(
		"download-without-flash-button");
	generateButton.addEventListener("click", onGenerateButtonClicked, false);
	/*generateWithoutFlashButton.addEventListener("click",
		onGenerateWithoutFlashButtonClicked, false);*/
	/*Downloadify.create('downloadify-button',{
		filename: "plugin-src.zip",
		data: generateAddon,
		transparent: false,
		swf: 'http://pixelgraphics.us/downloadify/media/downloadify.swf',
		downloadImage: 'http://pixelgraphics.us/downloadify/images/download.png',
		width: 100,
		height: 30,
		transparent: true,
		append: false,
		dataType: 'base64'
	});*/
}

function onGenerateButtonClicked(event) {
	try {
		var generatedData = generateAddon();
		window.location.href="data:application/zip;base64," + generatedData;
	} catch(err) {
	}
}


function generateAddon() {
	var pluginName = nameInput.value;
	if (pluginName === "") {
		alert("The plugin name must not be blank.");
		throw new Error();
	}
	var pluginVersion = versionInput.value;
	if (pluginVersion === "") {
		alert("No plugin version was entered: using 1.0.0");
		pluginVersion = "1.0.0";
	}
	var pluginAuthor = authorInput.value;
	if (pluginAuthor === "") {
		alert("The author name must not be blank.");
		throw new Error();
	}
	var pluginMode = "startup"; //FIXME
	var pluginPlatform = "BOTH"; //FIXME
	var pluginDescription = descriptionInput.value;
	var packageName = packageInput.value;
	if (packageName === "") {
		alert("The package name must not be blank.");
		throw new Error();
	}
	if (packageName.toLowerCase() !== packageName) {
		var fixItForMe = confirm("Normally, Java package names should be in lowercase.\n" + 
			"Your package name contains uppercase letters.\n" + 
			"\nWould you like your package name to be changed to " + packageName.toLowerCase() + "?");
		if (fixItForMe) {
			packageName = packageName.toLowerCase();
		}
	}
	if (packageName.indexOf(".") === -1) {
		alert("There must be at lease one dot in the package name.");
		throw new Error();
	}
	var mainClassName = mainClassInput.value;
	if (mainClassName === "") {
		alert("The main class name must not be blank.");
		throw new Error();
	}
	if (mainClassName.substring(0, 1) !== mainClassName.substring(0, 1).toUpperCase()) {
		var fixResult = mainClassName.substring(0, 1).toUpperCase() + mainClassName.substring(1);
		var fixItForMe = confirm("Normally, the first letter of a Java class's name should be in uppercase.\n" +
			"Would you like your main class name to be changed to " + fixResult + "?");
		if (fixItForMe) {
			mainClassName = fixResult;
		}
	}


	var mainClassFileContent = generateMainClassFile(packageName, mainClassName);
	//alert(mainClassFileContent);
	var addonYamlFileContent = generateAddonYaml(pluginName, pluginVersion, pluginAuthor, 
	pluginDescription, packageName, mainClassName, pluginMode, pluginPlatform);
	//alert(addonYamlFileContent);
	var addonPomFileContent = generateAddonPom(pluginName, packageName);
	//alert(addonPomFileContent);

	var zip = new JSZip();
	zip.add(pluginName + "/src/main/java/" + packageName.replace(/\./g, "/") + "/" + mainClassName + ".java", 
		mainClassFileContent);
	zip.add(pluginName + "/src/main/resources/spoutplugin.yml", addonYamlFileContent);
	zip.add(pluginName + "/pom.xml", addonPomFileContent);
	return zip.generate();
}

function generateMainClassFile(packageName, mainClassName) {
	return "package " + packageName + ";\n" +  	
	"import org.spout.api.plugin.CommonPlugin;\n" +
	"import org.spout.api.plugin.PluginDescriptionFile;\n" +  
	"public class " + mainClassName + " extends CommonPlugin {\n" +
	"	private PluginDescriptionFile pdfFile;\n\n" + 

	"	@Override\n" + 
	"	public void onDisable() {\n" + 
	"		getLogger().info(pdfFile.getFullName() + \" has been disabled!\");\n" + 
	"	}\n\n" + 

	"	@Override\n" + 
	"	public void onEnable() {\n" + 
	"		pdfFile = getDescription();\n" + 
	"		getLogger().info(pdfFile.getFullName() + \" has been enabled!\");\n" + 
	"	}\n" + 
	"}\n";

}

function generateAddonYaml(pluginName, pluginVersion, pluginAuthor, 
	pluginDescription, packageName, mainClassName, pluginLoad, pluginPlatform) {
	return  "name: " + pluginName + "\n" + 
		"version: " + pluginVersion + "\n" + 
		"description: " + pluginDescription + "\n" + 
		"author: " + pluginAuthor + "\n" + 
		"main: " + packageName + "." + mainClassName + "\n" + 
		"load: " + pluginLoad + "\n" + 
		"platform: " + pluginPlatform + "\n";
}

function generateAddonPom(pluginName, packageName) {
return "<project xmlns=\"http://maven.apache.org/POM/4.0.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" + 
" xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd\">\n" + 
"	<modelVersion>4.0.0</modelVersion>\n" + 
"	<groupId>" + packageName.substring(0, packageName.lastIndexOf(".")) + "</groupId>\n" + 
"	<artifactId>" + packageName.substring(packageName.lastIndexOf(".") + 1) + "</artifactId>\n" + 
"	<version>dev-SNAPSHOT</version>\n" + 
"	<name>" + pluginName + "</name>\n" + 
"	<description></description>\n" + 
"	<properties>\n" + 
"		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n" + 
"	</properties>\n" + 
"	<!-- Repository locations -->\n" + 
"	<repositories>\n" + 
"		<repository>\n" + 
"			<id>spout-repo</id>\n" + 
"			<url>http://repo.getspout.org</url>\n" + 
"		</repository>\n" + 
"	</repositories>\n" + 
"	<!--  Dependencies -->\n" + 
"	<dependencies>\n" + 
"		<dependency>\n" + 
"			<groupId>org.getspout</groupId>\n" + 
"			<artifactId>spoutapi</artifactId>\n" + 
"			<version>dev-SNAPSHOT</version>\n" + 
"			<type>jar</type>\n" + 
"			<scope>provided</scope>\n" + 
"		</dependency>\n" + 
"	</dependencies>\n" + 
"	<build>\n" + 
"		<defaultGoal>clean install</defaultGoal>\n" + 
"		<sourceDirectory>${basedir}/src/main/java</sourceDirectory>\n" + 
"		<!-- Resources -->\n" + 
"		<resources>\n" + 
"			<resource>\n" + 
"				<targetPath>.</targetPath>\n" + 
"				<filtering>true</filtering>\n" + 
"				<directory>${basedir}/src/main/resources</directory>\n" + 
"				<includes>\n" + 
"					<include>spoutplugin.yml</include>\n" + 
"				</includes>\n" + 
"			</resource>\n" + 
"		</resources>\n" + 
"		<plugins>\n" + 
"			<plugin>\n" + 
"				<groupId>org.apache.maven.plugins</groupId>\n" + 
"				<artifactId>maven-compiler-plugin</artifactId>\n" + 
"				<version>2.3.2</version>\n" + 
"			</plugin>\n" + 
"			<plugin>\n" + 
"				<groupId>org.apache.maven.plugins</groupId>\n" + 
"				<artifactId>maven-jar-plugin</artifactId>\n" + 
"				<version>2.3.2</version>\n" + 
"			</plugin>\n" + 
"		</plugins>\n" + 
"	</build>\n" + 
"</project>";
}


function onSubmit() {
}

window.onload = init;
