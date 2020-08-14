# Dublink Bus

An intelligent web-application for predicting Dublin Bus travel times

## Installation

```bash
cd {project-name}
```
Make a fresh python 3.7 virtual environment, & activate it:

```bash
virtualenv env -p python3.7
. env/bin/activate
```
Use the package manager [pip](https://pip.pypa.io/en/stable/) to install required packages:
```bash

pip install -r requirements.txt
```
```bash
export DB_PWD={password}
```
Connect to database using port-forwarding via ssh (Note: this step requires DB password):
```bash
ssh -N -f -L localhost:3307:localhost:3306 student@ipa-006.ucd.ie
```
## Usage


To run the app:

```bash
cd app
python manage.py runserver
```
Navigate to localhost:8000 to view site locally

## License
[MIT](https://choosealicense.com/licenses/mit/)
