pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom"; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here

    // Creates an instance of the matMul circuit.
    component multi = matMul(n,n,1);

    // Populates the input of the multi circuit.
    for (var i = 0; i < n; i++){
        for ( var j = 0; j < n; j++){
            multi.a[i][j] <== A[i][j];
        }   
        multi.b[i][0] <== x[i];
    }

    // checks if the sum of the output matrix of the multi circuit is the same as the sum of the constant matrix.
    component math1 = matElemSum(n, 1);
    component math2 = matElemSum(n, 1);

    for(var i = 0; i<n; i++){
        math1.a[i][0] <== multi.out[i][0];
        math2.a[i][0] <== b[i];
    }

    // checks if the sum are the same to verify the result.
    math1.out - math2.out === 0;

    out <== 1;

}

component main {public [A, b]} = SystemOfEquations(3);