/**
* ownCloud
*
* @author Vincent Petry
* @copyright 2014 Vincent Petry <pvince81@owncloud.com>
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
*
*/

/* global OC */
describe('Core base tests', function() {
	describe('Base values', function() {
		it('Sets webroots', function() {
			expect(OC.webroot).toBeDefined();
			expect(OC.appswebroots).toBeDefined();
		});
	});
	describe('basename', function() {
		it('Returns the nothing if no file name given', function() {
			expect(OC.basename('')).toEqual('');
		});
		it('Returns the nothing if dir is root', function() {
			expect(OC.basename('/')).toEqual('');
		});
		it('Returns the same name if no path given', function() {
			expect(OC.basename('some name.txt')).toEqual('some name.txt');
		});
		it('Returns the base name if root path given', function() {
			expect(OC.basename('/some name.txt')).toEqual('some name.txt');
		});
		it('Returns the base name if double root path given', function() {
			expect(OC.basename('//some name.txt')).toEqual('some name.txt');
		});
		it('Returns the base name if subdir given without root', function() {
			expect(OC.basename('subdir/some name.txt')).toEqual('some name.txt');
		});
		it('Returns the base name if subdir given with root', function() {
			expect(OC.basename('/subdir/some name.txt')).toEqual('some name.txt');
		});
		it('Returns the base name if subdir given with double root', function() {
			expect(OC.basename('//subdir/some name.txt')).toEqual('some name.txt');
		});
		it('Returns the base name if subdir has dot', function() {
			expect(OC.basename('/subdir.dat/some name.txt')).toEqual('some name.txt');
		});
		it('Returns dot if file name is dot', function() {
			expect(OC.basename('/subdir/.')).toEqual('.');
		});
		// TODO: fix the source to make it work like PHP's basename
		it('Returns the dir itself if no file name given', function() {
			// TODO: fix the source to make it work like PHP's dirname
			// expect(OC.basename('subdir/')).toEqual('subdir');
			expect(OC.basename('subdir/')).toEqual('');
		});
		it('Returns the dir itself if no file name given with root', function() {
			// TODO: fix the source to make it work like PHP's dirname
			// expect(OC.basename('/subdir/')).toEqual('subdir');
			expect(OC.basename('/subdir/')).toEqual('');
		});
	});
	describe('dirname', function() {
		it('Returns the nothing if no file name given', function() {
			expect(OC.dirname('')).toEqual('');
		});
		it('Returns the root if dir is root', function() {
			// TODO: fix the source to make it work like PHP's dirname
			// expect(OC.dirname('/')).toEqual('/');
			expect(OC.dirname('/')).toEqual('');
		});
		it('Returns the root if dir is double root', function() {
			// TODO: fix the source to make it work like PHP's dirname
			// expect(OC.dirname('//')).toEqual('/');
			expect(OC.dirname('//')).toEqual('/'); // oh no...
		});
		it('Returns dot if dir is dot', function() {
			expect(OC.dirname('.')).toEqual('.');
		});
		it('Returns dot if no root given', function() {
			// TODO: fix the source to make it work like PHP's dirname
			// expect(OC.dirname('some dir')).toEqual('.');
			expect(OC.dirname('some dir')).toEqual('some dir'); // oh no...
		});
		it('Returns the dir name if file name and root path given', function() {
			// TODO: fix the source to make it work like PHP's dirname
			// expect(OC.dirname('/some name.txt')).toEqual('/');
			expect(OC.dirname('/some name.txt')).toEqual('');
		});
		it('Returns the dir name if double root path given', function() {
			expect(OC.dirname('//some name.txt')).toEqual('/'); // how lucky...
		});
		it('Returns the dir name if subdir given without root', function() {
			expect(OC.dirname('subdir/some name.txt')).toEqual('subdir');
		});
		it('Returns the dir name if subdir given with root', function() {
			expect(OC.dirname('/subdir/some name.txt')).toEqual('/subdir');
		});
		it('Returns the dir name if subdir given with double root', function() {
			// TODO: fix the source to make it work like PHP's dirname
			// expect(OC.dirname('//subdir/some name.txt')).toEqual('/subdir');
			expect(OC.dirname('//subdir/some name.txt')).toEqual('//subdir'); // oh...
		});
		it('Returns the dir name if subdir has dot', function() {
			expect(OC.dirname('/subdir.dat/some name.txt')).toEqual('/subdir.dat');
		});
		it('Returns the dir name if file name is dot', function() {
			expect(OC.dirname('/subdir/.')).toEqual('/subdir');
		});
		it('Returns the dir name if no file name given', function() {
			expect(OC.dirname('subdir/')).toEqual('subdir');
		});
		it('Returns the dir name if no file name given with root', function() {
			expect(OC.dirname('/subdir/')).toEqual('/subdir');
		});
	});
	describe('Link functions', function() {
		var TESTAPP = 'testapp';
		var TESTAPP_ROOT = OC.webroot + '/appsx/testapp';

		beforeEach(function() {
			OC.appswebroots[TESTAPP] = TESTAPP_ROOT;
		});
		afterEach(function() {
			// restore original array
			delete OC.appswebroots[TESTAPP];
		});
		it('Generates correct links for core apps', function() {
			expect(OC.linkTo('core', 'somefile.php')).toEqual(OC.webroot + '/core/somefile.php');
			expect(OC.linkTo('admin', 'somefile.php')).toEqual(OC.webroot + '/admin/somefile.php');
		});
		it('Generates correct links for regular apps', function() {
			expect(OC.linkTo(TESTAPP, 'somefile.php')).toEqual(OC.webroot + '/index.php/apps/' + TESTAPP + '/somefile.php');
		});
		it('Generates correct remote links', function() {
			expect(OC.linkToRemote('webdav')).toEqual(window.location.protocol + '//' + window.location.host + OC.webroot + '/remote.php/webdav');
		});
		describe('Images', function() {
			it('Generates image path with given extension', function() {
				var svgSupportStub = sinon.stub(window, 'SVGSupport', function() { return true; });
				expect(OC.imagePath('core', 'somefile.jpg')).toEqual(OC.webroot + '/core/img/somefile.jpg');
				expect(OC.imagePath(TESTAPP, 'somefile.jpg')).toEqual(TESTAPP_ROOT + '/img/somefile.jpg');
				svgSupportStub.restore();
			});
			it('Generates image path with svg extension when svg support exists', function() {
				var svgSupportStub = sinon.stub(window, 'SVGSupport', function() { return true; });
				expect(OC.imagePath('core', 'somefile')).toEqual(OC.webroot + '/core/img/somefile.svg');
				expect(OC.imagePath(TESTAPP, 'somefile')).toEqual(TESTAPP_ROOT + '/img/somefile.svg');
				svgSupportStub.restore();
			});
			it('Generates image path with png ext when svg support is not available', function() {
				var svgSupportStub = sinon.stub(window, 'SVGSupport', function() { return false; });
				expect(OC.imagePath('core', 'somefile')).toEqual(OC.webroot + '/core/img/somefile.png');
				expect(OC.imagePath(TESTAPP, 'somefile')).toEqual(TESTAPP_ROOT + '/img/somefile.png');
				svgSupportStub.restore();
			});
		});
	});
	describe('Query string building', function() {
		it('Returns empty string when empty params', function() {
			expect(OC.buildQueryString()).toEqual('');
			expect(OC.buildQueryString({})).toEqual('');
		});
		it('Encodes regular query strings', function() {
			expect(OC.buildQueryString({
				a: 'abc',
				b: 'def'
			})).toEqual('a=abc&b=def');
		});
		it('Encodes special characters', function() {
			expect(OC.buildQueryString({
				unicode: '汉字',
			})).toEqual('unicode=%E6%B1%89%E5%AD%97');
			expect(OC.buildQueryString({
			   	b: 'spaace value',
			   	'space key': 'normalvalue',
			   	'slash/this': 'amp&ersand'
			})).toEqual('b=spaace%20value&space%20key=normalvalue&slash%2Fthis=amp%26ersand');
		});
		it('Encodes data types and empty values', function() {
			expect(OC.buildQueryString({
				'keywithemptystring': '',
			   	'keywithnull': null,
			   	'keywithundefined': null,
				something: 'else'
			})).toEqual('keywithemptystring=&keywithnull&keywithundefined&something=else');
			expect(OC.buildQueryString({
			   	'booleanfalse': false,
				'booleantrue': true
			})).toEqual('booleanfalse=false&booleantrue=true');
			expect(OC.buildQueryString({
			   	'number': 123,
			})).toEqual('number=123');
		});
	});
	describe('Session heartbeat', function() {
		var clock,
			oldConfig,
			loadedStub,
			routeStub,
			counter;

		beforeEach(function() {
			clock = sinon.useFakeTimers();
			oldConfig = window.oc_config;
			loadedStub = sinon.stub(OC.Router, 'registerLoadedCallback');
			routeStub = sinon.stub(OC.Router, 'generate').returns('/heartbeat');
			counter = 0;

			fakeServer.autoRespond = true;
			fakeServer.autoRespondAfter = 0;
			fakeServer.respondWith(/\/heartbeat/, function(xhr) {
				counter++;
				xhr.respond(200, {'Content-Type': 'application/json'}, '{}');
			});
		});
		afterEach(function() {
			clock.restore();
			window.oc_config = oldConfig;
			loadedStub.restore();
			routeStub.restore();
		});
		it('sends heartbeat half the session lifetime when heartbeat enabled', function() {
			window.oc_config = {
				session_keepalive: true,
				session_lifetime: 300
			};
			window.initCore();
			expect(loadedStub.calledOnce).toEqual(true);
			loadedStub.yield();
			expect(routeStub.calledWith('heartbeat')).toEqual(true);

			expect(counter).toEqual(0);

			// less than half, still nothing
			clock.tick(100 * 1000);
			expect(counter).toEqual(0);

			// reach past half (160), one call
			clock.tick(55 * 1000);
			expect(counter).toEqual(1);

			// almost there to the next, still one
			clock.tick(140 * 1000);
			expect(counter).toEqual(1);

			// past it, second call
			clock.tick(20 * 1000);
			expect(counter).toEqual(2);
		});
		it('does no send heartbeat when heartbeat disabled', function() {
			window.oc_config = {
				session_keepalive: false,
				session_lifetime: 300
			};
			window.initCore();
			expect(loadedStub.notCalled).toEqual(true);
			expect(routeStub.notCalled).toEqual(true);

			expect(counter).toEqual(0);

			clock.tick(1000000);

			// still nothing
			expect(counter).toEqual(0);
		});

	});
	describe('naturalSortCompare', function() {
		// cit() will skip tests if running on PhantomJS because it has issues with
		// localeCompare(). See https://github.com/ariya/phantomjs/issues/11063
		//
		// Please make sure to run these tests in Chrome/Firefox manually
		// to make sure they run.
		var cit = window.isPhantom?xit:it;

		// must provide the same results as \OC_Util::naturalSortCompare
		it('sorts alphabetically', function() {
			var a = [
				'def',
				'xyz',
				'abc'
			];
			a.sort(OC.Util.naturalSortCompare);
			expect(a).toEqual([
				'abc',
				'def',
				'xyz'
			]);
		});
		cit('sorts with different casing', function() {
			var a = [
				'aaa',
				'bbb',
				'BBB',
				'AAA'
			];
			a.sort(OC.Util.naturalSortCompare);
			expect(a).toEqual([
				'aaa',
				'AAA',
				'bbb',
				'BBB'
			]);
		});
		it('sorts with numbers', function() {
			var a = [
				'124.txt',
				'abc1',
				'123.txt',
				'abc',
				'abc2',
				'def (2).txt',
				'ghi 10.txt',
				'abc12',
				'def.txt',
				'def (1).txt',
				'ghi 2.txt',
				'def (10).txt',
				'abc10',
				'def (12).txt',
				'z',
				'ghi.txt',
				'za',
				'ghi 1.txt',
				'ghi 12.txt',
				'zz'
			];
			a.sort(OC.Util.naturalSortCompare);
			expect(a).toEqual([
				'123.txt',
				'124.txt',
				'abc',
				'abc1',
				'abc2',
				'abc10',
				'abc12',
				'def.txt',
				'def (1).txt',
				'def (2).txt',
				'def (10).txt',
				'def (12).txt',
				'ghi.txt',
				'ghi 1.txt',
				'ghi 2.txt',
				'ghi 10.txt',
				'ghi 12.txt',
				'z',
				'za',
				'zz'
			]);
		});
		it('sorts with chinese characters', function() {
			var a = [
				'十.txt',
				'一.txt',
				'二.txt',
				'十 2.txt',
				'三.txt',
				'四.txt',
				'abc.txt',
				'五.txt',
				'七.txt',
				'八.txt',
				'九.txt',
				'六.txt',
				'十一.txt',
				'波.txt',
				'破.txt',
				'莫.txt',
				'啊.txt',
				'123.txt'
			];
			a.sort(OC.Util.naturalSortCompare);
			expect(a).toEqual([
				'123.txt',
				'abc.txt',
				'一.txt',
				'七.txt',
				'三.txt',
				'九.txt',
				'二.txt',
				'五.txt',
				'八.txt',
				'六.txt',
				'十.txt',
				'十 2.txt',
				'十一.txt',
				'啊.txt',
				'四.txt',
				'波.txt',
				'破.txt',
				'莫.txt'
			]);
		});
		cit('sorts with umlauts', function() {
			var a = [
				'öh.txt',
				'Äh.txt',
				'oh.txt',
				'Üh 2.txt',
				'Üh.txt',
				'ah.txt',
				'Öh.txt',
				'uh.txt',
				'üh.txt',
				'äh.txt'
			];
			a.sort(OC.Util.naturalSortCompare);
			expect(a).toEqual([
				'ah.txt',
				'äh.txt',
				'Äh.txt',
				'oh.txt',
				'öh.txt',
				'Öh.txt',
				'uh.txt',
				'üh.txt',
				'Üh.txt',
				'Üh 2.txt'
			]);
		});
	});
});

