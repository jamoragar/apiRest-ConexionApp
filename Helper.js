//Helper.js

module.exports = {
    esTramoNatales: function(id_tramo){
        if(41 <= id_tramo && id_tramo <= 56)
            return true;
        else
            return false;
    },
    esTramoLeyNavarino: function(id_tramo){
        if(id_tramo == 1 || id_tramo == 2 || id_tramo == 3 || id_tramo == 4 || id_tramo == 5 || id_tramo == 6)
            return true;
        else
            return false;
    },
    formatoValor: function(numero){
        return JSON.stringify(('$ ' + numero.toLocaleString()));
    }
}