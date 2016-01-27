<?php

use Behat\Behat\Context\Context;
use Behat\Behat\Context\SnippetAcceptingContext;
use GuzzleHttp\Client;
use GuzzleHttp\Message\ResponseInterface;

require __DIR__ . '/../../vendor/autoload.php';

trait BasicStructure{
	/** @var string */
	private $currentUser = '';

	/** @var string */
	private $currentServer = '';

	/** @var string */
	private $baseUrl = '';

	/** @var ResponseInterface */
	private $response = null;

	public function __construct($baseUrl, $admin, $regular_user_password) {

		// Initialize your context here
		$this->baseUrl = $baseUrl;
		$this->adminUser = $admin;
		$this->regularUser = $regular_user_password;
		$this->localBaseUrl = substr($this->baseUrl, 0, -4);
		$this->remoteBaseUrl = substr($this->baseUrl, 0, -4);
		$this->currentServer = 'LOCAL';

		// in case of ci deployment we take the server url from the environment
		$testServerUrl = getenv('TEST_SERVER_URL');
		if ($testServerUrl !== false) {
			$this->baseUrl = $testServerUrl;
			$this->localBaseUrl = $testServerUrl;
		}

		// federated server url from the environment
		$testRemoteServerUrl = getenv('TEST_SERVER_FED_URL');
		if ($testRemoteServerUrl !== false) {
			$this->remoteBaseUrl = $testRemoteServerUrl;
		}
	}

	/**
	 * @Given /^As an "([^"]*)"$/
	 */
	public function asAn($user) {
		$this->currentUser = $user;
	}

	/**
	 * @Given /^Using server "([^"]*)"$/
	 */
	public function usingServer($server) {
		if ($server === 'LOCAL'){
			$this->baseUrl = $this->localBaseUrl;
			$this->currentServer = 'LOCAL';
		} elseif ($server === 'REMOTE'){
			$this->baseUrl = $this->remoteBaseUrl;
			$this->currentServer = 'REMOTE';
		} else{
			PHPUnit_Framework_Assert::fail("Server can only be LOCAL or REMOTE");
		}
	}

	/**
	 * @When /^sending "([^"]*)" to "([^"]*)"$/
	 */
	public function sendingTo($verb, $url) {
		$this->sendingToWith($verb, $url, null);
	}

	/**
	 * Parses the xml answer to get ocs response which doesn't match with
	 * http one in v1 of the api.
	 * @param ResponseInterface $response
	 * @return string
	 */
	public function getOCSResponse($response) {
		return $response->xml()->meta[0]->statuscode;
	}

	/**
	 * This function is needed to use a vertical fashion in the gherkin tables.
	 */
	public function simplifyArray($arrayOfArrays){
		$a = array_map(function($subArray) { return $subArray[0]; }, $arrayOfArrays);
		return $a;
	}

	/**
	 * @When /^sending "([^"]*)" to "([^"]*)" with$/
	 * @param \Behat\Gherkin\Node\TableNode|null $formData
	 */
	public function sendingToWith($verb, $url, $body) {
		$fullUrl = $this->baseUrl . "v{$this->apiVersion}.php" . $url;
		$client = new Client();
		$options = [];
		if ($this->currentUser === 'admin') {
			$options['auth'] = $this->adminUser;
		} else {
			$options['auth'] = [$this->currentUser, $this->regularUser];
		}
		if ($body instanceof \Behat\Gherkin\Node\TableNode) {
			$fd = $body->getRowsHash();
			$options['body'] = $fd;
		}

		try {
			$this->response = $client->send($client->createRequest($verb, $fullUrl, $options));
		} catch (\GuzzleHttp\Exception\ClientException $ex) {
			$this->response = $ex->getResponse();
		}
	}

	public function isExpectedUrl($possibleUrl, $finalPart){
		$baseUrlChopped = substr($this->baseUrl, 0, -4);
		$endCharacter = strlen($baseUrlChopped) + strlen($finalPart);
		return (substr($possibleUrl,0,$endCharacter) == "$baseUrlChopped" . "$finalPart");
	}

	/**
	 * @Then /^the OCS status code should be "([^"]*)"$/
	 */
	public function theOCSStatusCodeShouldBe($statusCode) {
		PHPUnit_Framework_Assert::assertEquals($statusCode, $this->getOCSResponse($this->response));
	}

	/**
	 * @Then /^the HTTP status code should be "([^"]*)"$/
	 */
	public function theHTTPStatusCodeShouldBe($statusCode) {
		PHPUnit_Framework_Assert::assertEquals($statusCode, $this->response->getStatusCode());
	}

	public static function removeFile($path, $filename){
		if (file_exists("$path" . "$filename")) {
			unlink("$path" . "$filename");
		}
	}

	/**
	 * @BeforeSuite
	 */
	public static function addFilesToSkeleton(){
		for ($i=0; $i<5; $i++){
			file_put_contents("../../core/skeleton/" . "textfile" . "$i" . ".txt", "ownCloud test text file\n");
		}
		if (!file_exists("../../core/skeleton/FOLDER")) {
			mkdir("../../core/skeleton/FOLDER", 0777, true);
		}
		if (!file_exists("../../core/skeleton/PARENT")) {
			mkdir("../../core/skeleton/PARENT", 0777, true);
		}
		file_put_contents("../../core/skeleton/PARENT/" . "parent.txt", "ownCloud test text file\n");
		if (!file_exists("../../core/skeleton/PARENT/CHILD")) {
			mkdir("../../core/skeleton/PARENT/CHILD", 0777, true);
		}
		file_put_contents("../../core/skeleton/PARENT/CHILD/" . "child.txt", "ownCloud test text file\n");

	}

	/**
	 * @AfterSuite
	 */
	public static function removeFilesFromSkeleton(){
		for ($i=0; $i<5; $i++){
			self::removeFile("../../core/skeleton/", "textfile" . "$i" . ".txt");
		}
		if (is_dir("../../core/skeleton/FOLDER")) {
			rmdir("../../core/skeleton/FOLDER");
		}
		self::removeFile("../../core/skeleton/PARENT/CHILD/", "child.txt");
		if (is_dir("../../core/skeleton/PARENT/CHILD")) {
			rmdir("../../core/skeleton/PARENT/CHILD");
		}
		self::removeFile("../../core/skeleton/PARENT/", "parent.txt");
		if (is_dir("../../core/skeleton/PARENT")) {
			rmdir("../../core/skeleton/PARENT");
		}


	}
}

