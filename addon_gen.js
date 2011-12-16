var nameInput;
var versionInput;
var authorInput;
var packageInput;
var mainClassInput;
var generateButton;
var generateWithoutFlashButton;
function init() {
	nameInput = document.getElementById("plugin-name-input");
	versionInput = document.getElementById("plugin-version-input");
	authorInput = document.getElementById("plugin-author-input");
	packageInput = document.getElementById("plugin-package-input");
	mainClassInput = document.getElementById("plugin-mainclass-input");

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
	var generatedData = generateAddon();
	window.location.href="data:application/zip;base64," + generatedData;
}


function generateAddon() {
	var pluginName = nameInput.value;
	var pluginVersion = versionInput.value;
	var pluginAuthor = authorInput.value;
	var pluginMode = "BOTH"; //FIXME
	var pluginDescription = "";
	var packageName = packageInput.value;
	var mainClassName = mainClassInput.value;
	var mainClassFileContent = generateMainClassFile(packageName, mainClassName);
	//alert(mainClassFileContent);
	var addonYamlFileContent = generateAddonYaml(pluginName, pluginVersion, pluginAuthor, 
	pluginDescription, packageName, mainClassName, pluginMode);
	//alert(addonYamlFileContent);
	var addonPomFileContent = generateAddonPom(pluginName, packageName);
	//alert(addonPomFileContent);

	var zip = new JSZip();
	zip.add(pluginName + "/src/main/java/" + packageName.replace(/\./g, "/") + "/" + mainClassName + ".java", 
		mainClassFileContent);
	zip.add(pluginName + "/src/main/resources/addon.yml", addonYamlFileContent);
	zip.add(pluginName + "/pom.xml", addonPomFileContent);
	return zip.generate();
}

function generateMainClassFile(packageName, mainClassName) {
	return "package " + packageName + ";\n" + 
	"import java.util.logging.Logger;\n" + 
	"import org.spoutcraft.spoutcraftapi.addon.AddonDescriptionFile;\n" + 	
	"import org.spoutcraft.spoutcraftapi.addon.java.JavaAddon;\n" + 
	"public class " + mainClassName + " extends JavaAddon {\n" + 
	"	public Logger log = Logger.getLogger(\"Spoutcraft\");\n" + 
	"	public AddonDescriptionFile adfFile;\n\n" + 

	"	@Override\n" + 
	"	public void onDisable() {\n" + 
	"		log.info(adfFile.getFullName() + \" has been disabled!\");\n" + 
	"	}\n\n" + 

	"	@Override\n" + 
	"	public void onEnable() {\n" + 
	"		adfFile = getDescription();\n" + 
	"		log.info(adfFile.getFullName() + \" has been enabled!\");\n" + 
	"	}\n" + 
	"}\n";

}

function generateAddonYaml(pluginName, pluginVersion, pluginAuthor, 
	pluginDescription, packageName, mainClassName, pluginMode) {
	return  "name: " + pluginName + "\n" + 
		"version: " + pluginVersion + "\n" + 
		"description: " + pluginDescription + "\n" + 
		"author: " + pluginAuthor + "\n" + 
		"main: " + packageName + "." + mainClassName + "\n" + 
		"mode: " + pluginMode + "\n";
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
"			<groupId>org.spoutcraft</groupId>\n" + 
"			<artifactId>spoutcraftapi</artifactId>\n" + 
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
"					<include>addon.yml</include>\n" + 
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
