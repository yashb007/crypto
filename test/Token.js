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
});

it('approves token for delegated transfer',function(){
    return Token.deployed().then(function(instance){
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1],100);
    }).then(function(success){
        assert.equal(success,true,"it returns true")
        return tokenInstance.approve(accounts[1],100, {from : accounts[0]})
}).then(function(receipt){
             assert.equal(receipt.logs.length,1,'triger event')    
             assert.equal(receipt.logs[0].event,'Approval','should be "Approval" event' )    
             assert.equal(receipt.logs[0].args._owner,accounts[0],"token are authorized by")    
             assert.equal(receipt.logs[0].args._spender,accounts[1],"tokens are authorized to")    
             assert.equal(receipt.logs[0].args._value,100,"transfer amount")    
             return tokenInstance.allowance(accounts[0],accounts[1]);
}).then(function(allowance){
    assert.equal(allowance,100,"stores allowance for transfer")
})
})
it('handles delegated token transfers', function() {
    return Token.deployed().then(function(instance) {
      tokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];
      // Transfer some tokens to fromAccount
      return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
    }).then(function(receipt) {
      // Approve spendingAccount to spend 10 tokens form fromAccount
      return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
    }).then(function(receipt) {
      // Try transferring something larger than the sender's balance
      return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
      // Try transferring something larger than the approved amount
      return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
      return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function(success) {
      assert.equal(success, true);
      return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
      return tokenInstance.balanceOf(fromAccount);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
      return tokenInstance.balanceOf(toAccount);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
      return tokenInstance.allowance(fromAccount, spendingAccount);
    }).then(function(allowance) {
      assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
    });
  });
})

