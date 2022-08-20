import logging

import azure.functions as func
from selenium import webdriver
from azure.identity import DefaultAzureCredential, ClientSecretCredential
from azure.storage.blob import BlobServiceClient
from datetime import datetime
import os

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request. 11:38')

    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome('/usr/local/bin/chromedriver', chrome_options=chrome_options)
    driver.get('https://pfaf.org/user/Default.aspx')
    plantName = req.params.get('name')
    searchbar = driver.find_element_by_name("ctl00$ContentPlaceHolder1$txtSearch")
    searchbar.send_keys(plantName)

    searchButton = driver.find_element_by_id("ContentPlaceHolder1_imgbtnSearch1")
    searchButton.click()
    example = driver.find_element_by_id("ContentPlaceHolder1_gvresults")
    row1 = example.find_elements_by_tag_name("tr")[1]
    latin_name = row1.find_elements_by_tag_name("td")[0]
    moisture = row1.find_elements_by_tag_name("td")[8]

    #return 200 as ok response 
    return func.HttpResponse(
             moisture.text,
             status_code=200
    )