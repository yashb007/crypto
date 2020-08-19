var Token = artifacts.require("./Token");
//accounts = web3.eth.getAccounts();
contract('Token',function(accounts){
    var tokenInstance;

    it('initialize the contract',function(){
        return Token.deployed().then(function(i){
            tokenInstance=i;
            return tokenInstance.name()
        }).then(function(name){
            assert.equal(name,'Token','has correct name')
            return tokenInstance.symbol()
        }).then(function(symbol){
            assert.equal(symbol,'Dapp','has correct symbol')
            return tokenInstance.standard()
        }).then(function(standard){
            assert.equal(standard,'Dapp v1.0','has correct standard')
        })
    })

    it('set the total supply',async () => {

        return Token.deployed().then(async ( i) => {
            tokenInstance = i;
            const supply = await tokenInstance.totalSupply();
            //console.log(supply)
            return supply;
        }).then(async (totalSupply) => {
            assert.equal(totalSupply.toNumber(),1000000,'set the total suply');
            const bal = await tokenInstance.balanceOf(accounts[0]);
            //console.log(bal)
            return bal;
        }).then(function(adminBal ){
            //console.log(adminBal.toNumber());
            assert.equal(adminBal.toNumber(),1000000,'it allocates the initial supply')
        })
    })

    it('transfer the ownership ',  () => {
        return Token.deployed().then(async (i) => {
            tokenInstance=i;
            const trans = await  tokenInstance.transfer.call(accounts[1],9999999999999); 
       
            return trans;
    }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        return tokenInstance.transfer.call(accounts[1],250000, {from:accounts[0]})
    }).then(function(success){
        assert.equal(success,true,"it returns true")
        return tokenInstance.transfer(accounts[1],250000, {from:accounts[0]})
       }).then(function(receipt){
             assert.equal(receipt.logs.length,1,'triger event')    
             assert.equal(receipt.logs[0].event,'Transfer','should be "Transfer" event' )    
             assert.equal(receipt.logs[0].args._from,accounts[0],"token are transfered from")    
             assert.equal(receipt.logs[0].args._to,accounts[1],"tokens are transfered to")    
             assert.equal(receipt.logs[0].args._value,250000,"transfer amount")    
            return tokenInstance.balanceOf(accounts[1])
       }).then(function(balance){
           console.log(balance)
           assert.equal(balance.toNumber(),'250000','add the amount to the reciever');
           return tokenInstance.balanceOf(accounts[0])
       }).then(function(balance){
        console.log(balance)
        assert.equal(balance.toNumber(),'750000','deduct the amount from the sender');
       })
})
})