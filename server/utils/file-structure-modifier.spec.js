/* global describe:true, beforeEach: true, afterEach:true, it:true */
'use strict';

// Utilities:
var _ = require('lodash');
var Promise = require('bluebird');

// Test Utilities:
var chai = require('chai');
var noop = require('node-noop').noop;
var rewire = require('rewire');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var expect = chai.expect;
chai.use(sinonChai);

// Under test:
var fileStructureModifier;

// Mocks:
var fileStructureUtilsMock = require('../utils/file-structure-utils/file-structure-utils.mock');
var revert;

describe('server/utils: file-structure-modifier:', function () {
    beforeEach(function () {
        fileStructureModifier = rewire('./file-structure-modifier');

        /* eslint-disable no-underscore-dangle */
        revert = fileStructureModifier.__set__({
            fileStructureUtils: fileStructureUtilsMock
        });
        /* eslint-enable no-underscore-dangle */
    });

    afterEach(function () {
        revert();
    });

    describe('create:', function () {
        it('should return a function:', function () {
            var modifier = fileStructureModifier.create();
            expect(_.isFunction(modifier)).to.be.true();
        });
    });

    it('should get the file structure and return it to the client:', function () {
        var response = {
            send: noop
        };

        sinon.stub(fileStructureUtilsMock, 'getFileStructure').returns(Promise.resolve({}));
        sinon.spy(response, 'send');

        return fileStructureModifier.create()(null, response)
        .then(function () {
            expect(fileStructureUtilsMock.getFileStructure.callCount).to.equal(1);
            expect(response.send).to.have.been.calledWith('{}');
        })
        .finally(function () {
            fileStructureUtilsMock.getFileStructure.restore();
        });
    });

    it('should run any `preSave` function:', function () {
        var options = {
            preSave: noop
        };
        var response = {
            send: noop
        };

        sinon.stub(fileStructureUtilsMock, 'getFileStructure').returns(Promise.resolve({}));
        sinon.stub(fileStructureUtilsMock, 'saveFileStructure').returns(Promise.resolve({}));
        sinon.stub(options, 'preSave').returns(Promise.resolve({}));
        sinon.spy(response, 'send');

        return fileStructureModifier.create(options)(null, response)
        .then(function () {
            expect(options.preSave.callCount).to.equal(1);
            expect(fileStructureUtilsMock.getFileStructure.callCount).to.equal(2);
            expect(fileStructureUtilsMock.saveFileStructure.callCount).to.equal(1);
        })
        .finally(function () {
            fileStructureUtilsMock.getFileStructure.restore();
            fileStructureUtilsMock.saveFileStructure.restore();
        });
    });

    it('should run any `postSave` function:', function () {
        var options = {
            postSave: noop
        };
        var response = {
            send: noop
        };

        sinon.stub(fileStructureUtilsMock, 'getFileStructure').returns(Promise.resolve({}));
        sinon.stub(fileStructureUtilsMock, 'saveFileStructure').returns(Promise.resolve({}));
        sinon.stub(options, 'postSave').returns(Promise.resolve({}));
        sinon.spy(response, 'send');

        return fileStructureModifier.create(options)(null, response)
        .then(function () {
            expect(options.postSave.callCount).to.equal(1);
            expect(fileStructureUtilsMock.getFileStructure.callCount).to.equal(2);
            expect(fileStructureUtilsMock.saveFileStructure.callCount).to.equal(1);

        })
        .finally(function () {
            fileStructureUtilsMock.getFileStructure.restore();
            fileStructureUtilsMock.saveFileStructure.restore();
        });
    });

    it('should run any `preSend` function:', function () {
        var options = {
            preSend: noop
        };
        var response = {
            send: noop
        };

        sinon.stub(fileStructureUtilsMock, 'getFileStructure').returns(Promise.resolve({}));
        sinon.stub(options, 'preSend').returns(Promise.resolve({}));
        sinon.spy(response, 'send');

        return fileStructureModifier.create(options)(null, response)
        .then(function () {
            expect(options.preSend.callCount).to.equal(1);
            expect(fileStructureUtilsMock.getFileStructure.callCount).to.equal(1);

        })
        .finally(function () {
            fileStructureUtilsMock.getFileStructure.restore();
        });
    });

    it('should handle any errors that occur:', function () {
        var logging = require('./logging');
        var response = {
            send: noop,
            status: noop
        };

        sinon.stub(logging, 'error');
        sinon.stub(fileStructureUtilsMock, 'getFileStructure').returns(Promise.reject(new Error()));
        sinon.spy(response, 'send');
        sinon.spy(response, 'status');

        return fileStructureModifier.create()(null, response)
        .then(function () {
            expect(fileStructureUtilsMock.getFileStructure.callCount).to.equal(1);
            expect(response.status).to.have.been.calledWith(500);
            expect(response.send).to.have.been.calledWith('{"error":"Operation failed."}');
        })
        .finally(function () {
            fileStructureUtilsMock.getFileStructure.restore();
            logging.error.restore();
        });
    });
});